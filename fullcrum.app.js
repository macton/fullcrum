var http              = require('http');
var path              = require('path');
var express           = require('express');
var passport          = require('passport');
var Q                 = require('q');
var Qx                = require('qx');
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
    "EmployeeQuestionnaireStatus"
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

/* send mail to admin */
/*
        if ( collectionName == 'Admins' ) {
          return postmark.send({
            to:      documentChanges.email,
            subject: 'Welcome to fullcrum.co!',
            html:    '<h1>Welcome to fullcrum!</h1>'
                    +'Hello ' + documentChanges.name + ',<br>'
                    +'You have been provided an administrator account.<br><br>'
                    +'To access the account, first log in to <a href="http://fullcrum.jit.su">fullcrum</a>, '
                    +'Then provide the one-time-use key: <b>' + results.id + '</b> when prompted.<br><br>'
                    +'Let us know if you have any trouble! -- welovedevs@fullcrum.co'
          })
          .then( function( mailResults ) {
            results.mail = { status: 'OK', results: mailResults };
            return results;
          })
          .fail( function( err ) {
            results.mail = { status: 'Error', results: err };
            return results;
          });
*/

exports.save = function( req, res ) {
  var deletes         = req.body.delete || {};
  var changes         = req.body.edit || {};
  var responses       = [];
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
