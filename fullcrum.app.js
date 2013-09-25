var http              = require('http');
var path              = require('path');
var express           = require('express');
var passport          = require('passport');
var Q                 = require('q');
var postmark          = require('./node-postmark');
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

exports.app   = app;
exports.start = function() {
  http.createServer(app).listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
  });
}

exports.sendCollection = function( collectionName, req, res ) {
  fullcrum.db.connection
    .then( function() {
      return fullcrum.db.collection( collectionName );
    })
    .then( function( collection ) {
      return fullcrum.db.collectionFind( collection );
    })
    .then( function( results ) {
      res.send(200, results);
    })
    .fail( function (err) {
      res.send(500, err);
    });
};

