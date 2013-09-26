var http           = require('http');
var Q              = require('q');
var postmarkConfig = require('./postmark.config');

var postmark = {
  send: function(options) {
    var deferred    = Q.defer();
    var token       = options.token || postmarkConfig.token;
    var from        = options.from || postmarkConfig.from;
    var secure      = options.secure || postmarkConfig.secure;
    var postmarkapp = http.createClient(80, postmarkConfig.domain, secure);
    var request     = postmarkapp.request('POST', postmarkConfig.endpoint, {
       'host':   this.domain, 
       'Accept': 'application/json', 
       'Content-Type':'application/json',
       'X-Postmark-Server-Token':token
    });

    var body = {
      "From" : from,
      "To" : (options.to || null),
      "Cc" : (options.cc || null),
      "Bcc": (options.bcc || null),
      "Subject" : (options.subject || postmarkConfig.subject),
      "Tag" : (options.tag || null),
      "HtmlBody" : (options.html || options.text),
      "TextBody" : (options.text || postmarkConfig.text),
      "ReplyTo" : (options.replyto || null),
      "Headers" : (options.headers || [])
    };

    request.end(JSON.stringify(body),'utf8');
    request.on('response', function (response) {
      var r = {};
      r.statusCode = response.statusCode;
      r.httpVersion = response.httpVersion;
      r.headers = response.headers;
      r.body = '';
      response.setEncoding('utf8');
      response.on('data', function (chunk) {
        r.body += chunk;
      });
      response.on('end', function () {
        r.body = JSON.parse(r.body);
        deferred.resolve( r );
      });
    });
    return deferred.promise;
  }
}
exports.send = postmark.send;
