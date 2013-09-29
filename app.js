
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

app.get('/adminInfo', ensureAuthenticated, ensureHasAccount, function( req, res ) {
  res.send(200, { masterQuestionnaireId: fullcrum.master.questionnaire._id, userName: req.user.name } );
});

app.get('/administrators', ensureAuthenticated, ensureFullcrumAdmin, function(req, res) {
  fullcrumApp.sendCollection('Admins', req, res);
});

app.get('/companies', ensureAuthenticated, ensureFullcrumAdmin, function(req, res) {
  fullcrumApp.sendCollection('Companies', req, res);
});

app.get('/questionnaires', ensureAuthenticated, ensureFullcrumAdmin, function(req, res) {
  fullcrumApp.sendCollection('Questionnaires', req, res);
});

app.get('/categories', ensureAuthenticated, ensureFullcrumAdmin, function(req, res) {
  fullcrumApp.sendCollection('Categories', req, res);
});

app.get('/summaryResponses', ensureAuthenticated, ensureFullcrumAdmin, function(req, res) {
  if ( req.param('questionnaireId') ) {
    fullcrumApp.sendCollection('SummaryResponses', req, res, { questionnaireId: req.param('questionnaireId') } );
  } else {
    res.send(400);
  }
});

app.get('/questions', ensureAuthenticated, ensureFullcrumAdmin, function(req, res) {
  if ( req.param('categoryId') ) {
    fullcrumApp.sendCollection('Questions', req, res, { categoryId: req.param('categoryId') } );
  } else {
    res.send(400);
  }
});

app.get('/responses', ensureAuthenticated, ensureFullcrumAdmin, function(req, res) {
  if ( req.param('categoryId') ) {
    fullcrumApp.sendCollection('Responses', req, res, { categoryId: req.param('categoryId') } );
  } else {
    res.send(400);
  }
});

app.get('/suggestions', ensureAuthenticated, ensureFullcrumAdmin, function(req, res) {
  if ( req.param('categoryId') ) {
    fullcrumApp.sendCollection('Suggestions', req, res, { categoryId: req.param('categoryId') } );
  } else {
    res.send(400);
  }
});

app.get('/admin/:file', ensureAuthenticated, ensureHasAccount, function(req, res, next) {
  res.sendfile( 'private/admin/' + req.param('file') );
});

app.post('/save', ensureAuthenticated, ensureHasAccount, function(req, res) {
  fullcrumApp.save( req, res );
});

fullcrumApp.start();
