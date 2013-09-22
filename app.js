
var postmark          = require('./node-postmark');
var fullcrum          = require('./fullcrum.api');
var fullcrumApp       = require('./fullcrum.app');
var fullcrumAuth      = require('./fullcrum.app.auth');

var app                 = fullcrumApp.app;
var ensureAuthenticated = fullcrumAuth.ensureAuthenticated;
var ensureHasAccount    = fullcrumAuth.ensureHasAccount;

fullcrumAuth.use();

app.get('/', ensureAuthenticated, ensureHasAccount, function(req, res, next){
  var adminConfig = { user: req.user };
  if ( req.user.companyId == fullcrum.master.company._id ) {
    console.log('admin');
    fullcrum.db.connection.then( function() {
      console.log('connection');
      return fullcrum.db.collection('Companies')
    })
    .then( function( collection ) {
      console.log('companies');
      return fullcrum.db.collectionFind( collection );
    })
    .then( function( companies ) {
      console.log('render admin');
      adminConfig.companies = companies;
      res.render( 'admin', adminConfig );
    })
    .fail( function( err ) {
      next(err);
    });
  } else {
    console.dir( adminConfig );
    console.log('render company admin');
    res.render( 'admin', adminConfig );
  }
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

process.on('uncaughtException', function(err) {
   
  console.log('Caught exception: ' + err);
});

fullcrumApp.start();
