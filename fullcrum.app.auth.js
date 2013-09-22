
var passport          = require('passport');
var fullcrumApp       = require('./fullcrum.app');
var fullcrum          = require('./fullcrum.api');
var LinkedInStrategy  = require('passport-linkedin').Strategy;
var linkedinConfig    = require('./fullcrum.linkedin.config');
var app               = fullcrumApp.app;

exports.ensureAuthenticated = function(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  console.log('redirect login');
  res.redirect('/login');
};

exports.ensureHasAccount = function(req, res, next) {
  if (req.user && req.user._id) {
    return next();
  }
  console.log('redirect new-account');
  res.redirect('/new-account');
};

exports.use = function() {

  passport.serializeUser(function(user, done) {
    // console.log('seralizeUser');
    // console.dir(user);
    done(null, user);
  });
  
  passport.deserializeUser(function(obj, done) {
    // console.log('deseralizeUser');
    // console.dir(obj);
    done(null, obj);
  });
  
  // #todo callbackURL
  passport.use(new LinkedInStrategy({
      consumerKey:    linkedinConfig.apiKey,
      consumerSecret: linkedinConfig.secretKey,
      callbackURL:    "http://192.168.1.85:3000/auth/linkedin/callback",
      profileFields: ['id', 'first-name', 'last-name', 'email-address', 'headline']
    },
    function(token, tokenSecret, profile, done) {
      fullcrum.db.connection.then( function() {
        return fullcrum.db.collection('Admins');
      })
      .then( function( collection ) {
        return fullcrum.db.collectionFindOne( collection, { loginId: profile.id } );
      })
      .then( function( admin ) {
        if (!admin) {
          admin = { name: profile.displayName };
        } 
        admin.loginId = profile.id;
        return done( null, admin );        
      })
      .fail( function( err ) {
        return done( err );  
      });
    }
  ));
  
  app.post('/account-connect', exports.ensureAuthenticated, function(req,res) {
    var accountCode = req.param('accountCode');

    fullcrum.db.connection.then( function() {
      return fullcrum.db.collection('Admins');
    })
    .then( function( collection ) {
      return fullcrum.db.collectionFindOneById( collection, accountCode )
        // is this account already connected?
        .then( function( admin ) {
          console.log('// is this account already connected?');
          if (!admin) {
            throw new Error('Account does not exist');
          }
          if (admin.loginId) {
            throw new Error('Account has already been connected');
          }
        })
        // update account with loginId
        .then( function() {
          console.log('// update account with loginId');
          return fullcrum.db.collectionUpdateById( collection, accountCode, { '$set' : { loginId: req.user.loginId } } )
        })
        // return account data
        .then( function( result ) {
          console.log('// return account data');
          return fullcrum.db.collectionFindOne( collection, { loginId: req.user.loginId } );
        });
    })
    // copy found admin account into live user data
    .then( function( admin ) {
      console.log('// copy found admin account into live user data');
      for ( var key in admin ) {
        if ( admin.hasOwnProperty( key ) ) { 
          req.user[ key ] = admin[ key ];
        }
      }
    })
    .then( function() {
      console.log( 'account-connect ' + accountCode );
      res.send( 200, { status: 'OK', accountCode: accountCode } );
    })
    .fail( function( err ) {
      console.log( err );
      res.send( 200, { status: 'Failed', message: err.toString() } );
    });
  });

  app.get('/login', function(req, res){
    res.render('login', { user: req.user });
  });

  app.get('/new-account', function(req, res){
    res.render('new-account', { user: req.user });
  });

  app.get('/auth/linkedin',
    passport.authenticate('linkedin', { scope: ['r_basicprofile', 'r_emailaddress', 'r_contactinfo'] }),
    function(req, res){
      // The request will be redirected to LinkedIn for authentication, so this
      // function will not be called.
    });

  app.get('/auth/linkedin/callback',
    passport.authenticate('linkedin', { failureRedirect: '/login' }),
    function(req, res) {
      console.log('redirect /');
      res.redirect('/');
    }); 

  app.get('/logout', function(req, res){
    req.logout();
    console.log('redirect /');
    res.redirect('/');
  });
}
