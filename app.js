
var postmark          = require('./node-postmark');
var fullcrum          = require('./fullcrum.api');
var fullcrumApp       = require('./fullcrum.app');
var fullcrumAuth      = require('./fullcrum.app.auth');

var app                 = fullcrumApp.app;
var ensureAuthenticated = fullcrumAuth.ensureAuthenticated;
var ensureHasAccount    = fullcrumAuth.ensureHasAccount;
var ensureFullcrumAdmin = fullcrumAuth.ensureFullcrumAdmin;

fullcrumAuth.use();

app.get('/', ensureAuthenticated, ensureHasAccount, function(req, res, next){
  if ( req.user.companyId == fullcrum.master.company._id ) {
    res.redirect('/admin/fullcrum.html');
  } else {
    res.redirect('/admin/company.html');
  }
});

app.get('/administrators', ensureAuthenticated, ensureFullcrumAdmin, function(req, res) {
  fullcrumApp.sendCollection('Admins', req, res);
});

app.get('/companies', ensureAuthenticated, ensureFullcrumAdmin, function(req, res) {
  fullcrumApp.sendCollection('Companies', req, res);
});

app.get('/admin/:file', ensureAuthenticated, ensureHasAccount, function(req, res, next) {
  fullcrumApp.staticMiddleware( req, res, next );
});

app.post('/send_email', function( req, res ) {
  postmark.send({
    to: 'macton@gmail.com',
    subject: 'fullcrum email test',
    text: 'Hey Keith, it\'s macton. This is just testing email integration. You should receive this when I click a button. You might get more than one because I\'m testing that. Don\'t worry, I\'ll switch it off your address so I don\'t spam you. But I wanted to test against someone that wasn\'t me to be sure. You should confirm the email you got from postmarkapp.com as well. Also does this appear as a link to you? http://fullcrum.jit.su/report.html'
  }, function(response){
    console.log('RESPONSE IS ' + JSON.stringify(response));
  });
});

fullcrumApp.start();
