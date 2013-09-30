var http              = require('http');
var path              = require('path');
var express           = require('express');
var passport          = require('passport');
var Q                 = require('q');
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
    "Employees"
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
  var changes         = req.body;
  var responses       = [];
  var promises        = [];

  // validate access to save
  for ( var collectionName in changes ) {
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

  for ( var collectionName in changes ) {
    var collectionChanges = changes[ collectionName ];

    for ( var documentId in collectionChanges ) {
      var documentChanges = collectionChanges[ documentId ];
      promises.push( saveDocumentChanges( collectionName, documentId, documentChanges ) );
    }
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

