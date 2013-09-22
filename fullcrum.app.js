var http              = require('http');
var path              = require('path');
var express           = require('express');
var passport          = require('passport');
var Q                 = require('q');
var postmark          = require('./node-postmark');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');

// Docs for Jade http://naltatis.github.io/jade-syntax-docs/
app.set('view engine', 'ejs');

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
app.use(express.static(__dirname + '/public'));

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

