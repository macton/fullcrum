var http              = require('http');
var path              = require('path');
var express           = require('express');
var passport          = require('passport');
var Q                 = require('q');
var Qx                = require('qx');
var ejs               = require('ejs');
var postmark          = require('./postmark');
var fullcrum          = require('./fullcrum.api');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');

app.use(express.favicon());
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser());
app.use(express.session({ secret: 'lifting developers' }));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Router
app.use(app.router);
app.use(express.compress());
app.use(express.staticCache());

exports.staticMiddleware = express.static(__dirname + '/public');
app.use( exports.staticMiddleware );

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

function classifyScore( score ) {
  if ( score < 0.75 ) {
    return 'kNegative';
  }
  if ( score > 0.75 ) {
    return 'kPositive';
  }
  return 'kNeutral';
}

function hasCollectionChangeAccess( collectionName, user ) {
  var isFullcrumAdmin = ( user.companyId == fullcrum.master.company._id );
  var fullcrumAdminOnlyCollections = [ 
    "About",
    "Admins",
    "Companies",
    "Tokens",
    "Categories",
    "Questions",
    "Responses",
    "Suggestions",
    "AdditionalSuggestions",
    "SummaryResponses"
  ];

  if ( fullcrumAdminOnlyCollections.indexOf( collectionName ) != -1 ) {
    return isFullcrumAdmin;
  }

  var adminCollections = [ 
    "EmployeeGroupConnections",
    "EmployeeGroups",
    "Employees",
    "EmployeeQuestionnaireStatus",
    "QuestionnaireInstances"
  ];

  if ( adminCollections.indexOf( collectionName ) != -1 ) {
    return true;
  }

  return false;
}

exports.app   = app;
exports.start = function() {
  http.createServer(app).listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
  });
}

exports.sendCollection = function( collectionName, req, res, query ) {
  fullcrum.db.connection
    .then( function() {
      return fullcrum.db.collection( collectionName );
    })
    .then( function( collection ) {
      return fullcrum.db.collectionFind( collection, query );
    })
    .then( function( results ) {
      res.send(200, results);
    })
    .fail( function (err) {
      res.send(500, err);
    });
};

function sendAdminEmailUpdates( adminChanges ) {
  for ( adminId in adminChanges ) {
    fullcrum.db.connection
      .then( function() {
        return fullcrum.db.collection( 'Admins' );
      })
      .then( function( collection ) {
        return fullcrum.db.collectionFindOneById( collection, adminId );
      })
      .then( function( admin ) {
        return postmark.send({
            to:      admin.email,
            subject: 'Welcome to fullcrum.co!',
            html:    '<h1>Welcome to fullcrum!</h1>'
                    +'Hello ' + admin.name + ',<br>'
                    +'You have been provided an administrator account.<br><br>'
                    +'To access the account, first log in to <a href="' + fullcrum.config.hostUrl + '">fullcrum</a>, '
                    +'Then provide the one-time-use key: <b>' + adminId + '</b> when prompted.<br><br>'
                    +'Let us know if you have any trouble! -- welovedevs@fullcrum.co'
          })
          .then( function( results ) {
            console.log( results );
          })
          .fail( function( err ) {
            console.log( err );
          });
      })
      .fail( function( err ) {
        console.log( err );
      });
  }
}

exports.save = function( req, res ) {
  var deletes         = req.body.delete || {};
  var changes         = req.body.edit || {};
  var promises        = [];
  var collectionName;
  var documentId;

  // validate access to save
  for ( var collectionName in changes ) {
    if ( !hasCollectionChangeAccess( collectionName, req.user ) ) {
      res.send(401);    
      return;
    }
  }
  for ( var collectionName in deletes ) {
    if ( !hasCollectionChangeAccess( collectionName, req.user ) ) {
      res.send(401);    
      return;
    }
  }

  var saveDocumentChanges = function( collectionName, documentId, documentChanges ) {
    return fullcrum.db.collection( collectionName ) 
      .then( function( collection ) {
        return fullcrum.db.collectionUpdateById( collection, documentId, { '$set' : documentChanges } );    
      })
      .then( function( results ) {
        return { status: 'updated', collectionName: collectionName, id: documentId };
      });
  };

  var deleteDocument = function( collectionName, documentId ) {
    return fullcrum.db.collection( collectionName ) 
      .then( function( collection ) {
        return fullcrum.db.collectionRemoveById( collection, documentId );
      })
      .then( function( results ) {
        return { status: 'removed', collectionName: collectionName, id: documentId };
      });
  };

  for ( collectionName in changes ) {
    var collectionChanges = changes[ collectionName ];

    for ( documentId in collectionChanges ) {
      var documentChanges = collectionChanges[ documentId ];
      promises.push( saveDocumentChanges( collectionName, documentId, documentChanges ) );
    }
    if ( collectionName === 'Admins' ) {
      sendAdminEmailUpdates( collectionChanges );
    }
  }

  for ( collectionName in deletes ) {
    var collectionDeletes = deletes[ collectionName ]; 
    collectionDeletes.forEach( function( documentId ) {
      promises.push( deleteDocument( collectionName, documentId ) );
    });
  }

  Q.allSettled( promises )
    .then( function( results ) {
      console.dir( results );
      res.send( 200, results );
    })
    .fail( function( err ) {
      res.send( 500, err );
    });
};

exports.saveQuestionnaireResults = function( req, res, questionnaireResults ) {

  if ( (!questionnaireResults) || (!questionnaireResults.length) ) {
    res.send(400, questionnaireResults );
    return;
  }
  
  var employeeId              = questionnaireResults[0].employeeId;
  var companyId               = questionnaireResults[0].companyId;
  var questionnaireInstanceId = questionnaireResults[0].questionnaireInstanceId;
  var employeeEmail;
  var collectedResults = {};

  fullcrum.db.connection
    .then( function() {
      return fullcrum.db.collection( 'Employees' )
        .then( function( collection ) {
          return fullcrum.db.collectionFindOneById( collection, employeeId )
            .then( function( employee ) {
              employeeEmail = employee.email;  
            })
            .then( function( results ) {
              collectedResults.employee = results;
            });
        });
    })
    .then( function() {
      return fullcrum.db.collection( 'QuestionnaireResults' )
        .then( function( collection ) {
          return fullcrum.db.collectionInsert( collection, questionnaireResults );
        })
        .then( function( results ) {
          collectedResults.questionnaireResults = results;
        });
    })
    .then( function() {
      return fullcrum.db.collection('EmployeeQuestionnaireStatus')
        .then( function( collection ) {
          return fullcrum.db.collectionFindOne( collection, { email: employeeEmail, questionnaireInstanceId: questionnaireInstanceId, companyId: companyId } )
            .then( function( employeeStatus ) {
              var employeeStatusId = employeeStatus._id.toHexString();
              return fullcrum.db.collectionUpdateById( collection, employeeStatusId, { '$set' : { state: 'kCompleted' } } );
            })
            .then( function( results ) {
              collectedResults.employeeQuestionnaireStatus = results;
            });
        });
    })
    .then( function() {
      res.send( 200, collectedResults );
    })
    .fail( function (err) {
      res.send( 500, err.toString() );
    });
};

exports.singleEmployeeQuestionnaireStatus = function( req, res ) {
  var companyId               = req.param('companyId');
  var questionnaireInstanceId = req.param('questionnaireInstanceId');
  var employeeId              = req.param('employeeId');
  var employeeEmail;

  fullcrum.db.connection
    .then( function() {
      return fullcrum.db.collection( 'Employees' )
        .then( function( collection ) {
          return fullcrum.db.collectionFindOneById( collection, employeeId )
            .then( function( employee ) {
              employeeEmail = employee.email;  
            });
        });
    })
    .then( function() {
      return fullcrum.db.collection('EmployeeQuestionnaireStatus')
        .then( function( collection ) {
          return fullcrum.db.collectionFindOne( collection, { email: employeeEmail, questionnaireInstanceId: questionnaireInstanceId, companyId: companyId } )
            .then( function( employeeStatus ) {
              res.send( 200, employeeStatus );
            });
        });
    })
    .fail( function (err) {
      res.send( 500, err.toString() );
    });
};

exports.singleEmployeeResults = function( req, res ) {
  var companyId               = req.param('companyId');
  var questionnaireInstanceId = req.param('questionnaireInstanceId');
  var employeeId              = req.param('employeeId');
  var questionnaireId;

  fullcrum.db.connection
    .then( function() {
      return fullcrum.db.collection( 'Companies' );
    })
    .then( function( collection ) {
      return fullcrum.db.collectionFindOneById( collection, companyId );
    })
    .then( function( company ) {
      questionnaireId = company.questionnaireId;
    })
    .then( function() {
      return fullcrum.db.collection( 'QuestionnaireResults' );
    })
    .then( function( collection ) {
      return fullcrum.db.collectionFind( collection, { employeeId: employeeId, questionnaireInstanceId: questionnaireInstanceId, companyId: companyId } );
    })
    .then( Qx.map( function( result ) {
      return fullcrum.db.collection( 'Questions' )
        .then( function( collection ) {
          return fullcrum.db.collectionFindOneById( collection, result.questionId );
        })
        .then( function( question ) {
          result.categoryId = question.categoryId;
          return result;
        });
    }))
    .then( function( results ) {
      var categoryWorking = {};
      var categoryResults = [];

      results.forEach( function( result ) {
        if ( categoryWorking[ result.categoryId ] ) {
          categoryWorking[ result.categoryId ].count++;
          categoryWorking[ result.categoryId ].score += parseInt(result.score);
        } else {
          categoryWorking[ result.categoryId ] = {
            count: 1,
            score: parseInt(result.score)
          };
        }
      });
      for (var categoryId in categoryWorking) {
        var score      = ( categoryWorking[categoryId].score / categoryWorking[categoryId].count );
        var scoreClass = classifyScore( score );
        categoryResults.push( {
          categoryId: categoryId,
          scoreClass: scoreClass,
          responses: [],
          suggestions: []
        });
      }
      return categoryResults;
    })
    .then( Qx.map( function( result ) {
      return fullcrum.db.collection( 'Categories' )
        .then( function( collection ) {
          return fullcrum.db.collectionFindOneById( collection, result.categoryId );
        })
        .then( function( category ) {
          result.categoryName = category.name;
          return result;
        });
    }))
    .then( Qx.map( function( result ) {
      return fullcrum.db.collection( 'Responses' )
        .then( function( collection ) {
          return fullcrum.db.collectionFind( collection, { categoryId: result.categoryId, responseType: result.scoreClass } );
        })
        .then( function( responses ) {
          result.responses = result.responses.concat( responses );
          return result;
        });
    }))
    .then( Qx.map( function( result ) {
      return fullcrum.db.collection( 'Responses' )
        .then( function( collection ) {
          return fullcrum.db.collectionFind( collection, { categoryId: result.categoryId, responseType: 'kAny' } );
        })
        .then( function( responses ) {
          result.responses = result.responses.concat( responses );
          return result;
        });
    }))
    .then( Qx.map( function( result ) {
      return fullcrum.db.collection( 'Suggestions' )
        .then( function( collection ) {
          return fullcrum.db.collectionFind( collection, { categoryId: result.categoryId, responseType: result.scoreClass } );
        })
        .then( function( suggestions ) {
          result.suggestions = result.suggestions.concat( suggestions ); 
          return result;
        });
    }))
    .then( Qx.map( function( result ) {
      return fullcrum.db.collection( 'Suggestions' )
        .then( function( collection ) {
          return fullcrum.db.collectionFind( collection, { categoryId: result.categoryId, responseType: 'kAny' } );
        })
        .then( function( suggestions ) {
          result.suggestions = result.suggestions.concat( suggestions ); 
          return result;
        });
    }))
    .then( Qx.map( function( result ) {
      return fullcrum.db.collection( 'AdditionalSuggestions' )
        .then( function( collection ) {
          return fullcrum.db.collectionFind( collection, { categoryId: result.categoryId, responseType: result.scoreClass, companyId: companyId } );
        })
        .then( function( suggestions ) {
          result.suggestions = result.suggestions.concat( suggestions ); 
          return result;
        });
    }))
    .then( Qx.map( function( result ) {
      return fullcrum.db.collection( 'AdditionalSuggestions' )
        .then( function( collection ) {
          return fullcrum.db.collectionFind( collection, { categoryId: result.categoryId, responseType: 'kAny', companyId: companyId } );
        })
        .then( function( suggestions ) {
          result.suggestions = result.suggestions.concat( suggestions ); 
          return result;
        });
    }))
    .then( function( results ) {
      results.sort( function( a, b ) {
        var sortOrder = {
          'kNegative': { 'kNegative': 0, 'kPostive': -1, 'kNeutral': -1 },
          'kNeutral':  { 'kNegative': 1, 'kPostive': -1, 'kNeutral':  0 },
          'kPositive': { 'kNegative': 1, 'kPostive':  0, 'kNeutral':  1 },
        };
        return sortOrder[a.scoreClass][b.scoreClass];
      });

      var negativeCount = 0;
      var negativeCategories = [];
      results.forEach( function( result ) {
        if ( result.scoreClass === 'kNegative' ) {
          negativeCount++;
          negativeCategories.push( result.categoryName );
        }
      });

      if ( negativeCount === 0 ) {
         summaryType = 'kAllPositive';
      } else if ( negativeCount === 1 ) {
         summaryType = 'kOneNegative';
      } else if ( negativeCount === results.length ) {
         summaryType = 'kAllNegative';
      } else {
         summaryType = 'kSomeNegative';
      }

      return fullcrum.db.collection( 'SummaryResponses' )
        .then( function( collection ) {
          return fullcrum.db.collectionFindOne( collection, { questionnaireId: questionnaireId, summaryType: summaryType } );
        })
        .then( function( summary ) {
          var summaryVars = {
            negativeCategories: negativeCategories.join(', ')
          };

          summary.text = ejs.render( summary.text, summaryVars );

          return {
            summary: summary,
            categoryResults: results
          };
        });
    })
    .then( function( results ) {
      res.send( 200, results );      
    })
    .fail( function (err) {
      res.send( 500, err.toString() );
    });
};

exports.startQuestionnaire = function( req, res, body ) {

  var companyId               = body.companyId;
  var questionnaireInstanceId = body.questionnaireInstanceId;
  var employeeId              = body.employeeId;
  var employeeEmail;
  var collectedResults = {};

  fullcrum.db.connection
    .then( function() {
      return fullcrum.db.collection( 'Employees' )
        .then( function( collection ) {
          return fullcrum.db.collectionFindOneById( collection, employeeId )
            .then( function( employee ) {
              employeeEmail = employee.email;  
            })
            .then( function( results ) {
              collectedResults.employee = results;
            });
        });
    })
    .then( function() {
      return fullcrum.db.collection('EmployeeQuestionnaireStatus')
        .then( function( collection ) {
          return fullcrum.db.collectionFindOne( collection, { email: employeeEmail, questionnaireInstanceId: questionnaireInstanceId, companyId: companyId } )
            .then( function( employeeStatus ) {
              var employeeStatusId = employeeStatus._id.toHexString();
              return fullcrum.db.collectionUpdateById( collection, employeeStatusId, { '$set' : { state: 'kStarted' } } );
            })
            .then( function( results ) {
              collectedResults.employeeQuestionnaireStatus = results;
            });
        });
    })
    .then( function() {
      res.send( 200, collectedResults );
    })
    .fail( function (err) {
      res.send( 500, err.toString() );
    });
};

exports.createQuestionnaire = function( req, res, questionnaire ) {
  var collectedResults = {};
  collectedResults.mail = [];
  var questionnaireInstanceId;

  questionnaire.state = 'kOpen';
  fullcrum.db.connection
    .then( function() {
      return fullcrum.db.collection( 'QuestionnaireInstances' );
    })
    .then( function( collection ) {
      return fullcrum.db.collectionInsert( collection, questionnaire );
    })
    .then( function( results ) {
      collectedResults.addQuestionnaire = results;
      questionnaireInstanceId = results[0]._id.toHexString();
      console.log( results );
    })
    .then( function() {
      console.log('Get Employees');
      return fullcrum.db.collection( 'Employees' );
    })
    .then( function( collection ) {
      console.log('Get Employees for ' + questionnaire.companyId );
      return fullcrum.db.collectionFind( collection, { companyId: questionnaire.companyId } );
    })
    .then( Qx.map( function( employee ) {
      console.log( employee );
      return postmark.send({
        to:      employee.email,
        subject: 'Welcome to fullcrum.co!',
        html:    '<h1>Welcome to fullcrum!</h1>'
                +'Hello ' + employee.name + ',<br><br>'
                +'Your company has started a new questionnaire and is asking for your feedback.<br><br>'
                +'As part of the process, you will also hopefully gain some insights into your own situation and immediate suggestions and recommendations will be presented to you.<br><br>'
                +'We have also made every effort to keep your results anonymous.<br><br>'
                +'<a href=' + fullcrum.config.hostUrl + '/questionnaire/?cid=' + questionnaire.companyId + '&uid=' + employee._id.toHexString() + '&qid=' + questionnaireInstanceId +'>Your unique questionnaire link</a><br><br>'
                +'Let us know if you have any trouble! -- welovedevs@fullcrum.co'
      })
      .then( function( mailResults ) {
        console.log( mailResults );
        collectedResults.mail.push( { status: 'OK', results: mailResults, email: employee.email  } );
        return { state: 'kUnopened', email: employee.email, name: employee.name, questionnaireInstanceId: questionnaireInstanceId, companyId: questionnaire.companyId };
      })
      .fail( function( err ) {
        console.log( err );
        collectedResults.mail.push( { status: 'Error', results: err } );
        return { state: 'kUnsent', email: employee.email, name: employee.name, questionnaireInstanceId: questionnaireInstanceId, companyId: questionnaire.companyId };
      });
    }))
    .then( function( results ) {
      console.log( 'mail results = ' );
      console.log( results );
      return fullcrum.db.collection('EmployeeQuestionnaireStatus')
        .then( function( collection ) { 
          return fullcrum.db.collectionInsert( collection, results );
        })
        .then( function( results ) {
          console.log( 'EmployeeQuestionnaireStatus results = ' );
          console.log( results );
          collectedResults.employeeQuestionnaireStatus = results;
        });
    })
    .then( function() {
      res.send( 200, collectedResults );
    })
    .fail( function (err) {
      res.send( 500, err.toString() );
    });
}
