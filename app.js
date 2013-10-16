
var fullcrum          = require('./fullcrum.api');
var fullcrumApp       = require('./fullcrum.app');
var fullcrumAuth      = require('./fullcrum.app.auth');
var Q                 = require('q');  
var Qx                = require('qx');  

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
  res.send(200, { masterQuestionnaireId: fullcrum.master.questionnaire._id, userName: req.user.name, userCompanyId: req.user.companyId } );
});

app.get('/administrators', ensureAuthenticated, ensureFullcrumAdmin, function(req, res) {
  fullcrumApp.sendCollection('Admins', req, res);
});

app.get('/employees', ensureAuthenticated, ensureHasAccount, function(req, res) {
  fullcrumApp.sendCollection('Employees', req, res, { companyId: req.user.companyId } );
});

app.get('/employeeGroups', ensureAuthenticated, ensureHasAccount, function(req, res) {
  fullcrumApp.sendCollection('EmployeeGroups', req, res, { companyId: req.user.companyId } );
});

app.get('/openQuestionnaire', ensureAuthenticated, ensureHasAccount, function(req, res) {
  fullcrumApp.sendCollection('QuestionnaireInstances', req, res, { companyId: req.user.companyId, state: 'kOpen' } );
});

app.get('/employeeQuestionnaireStatus', ensureAuthenticated, ensureHasAccount, function(req, res) {
  if ( req.param('questionnaireInstanceId') ) {
    fullcrumApp.sendCollection('EmployeeQuestionnaireStatus', req, res, { companyId: req.user.companyId, questionnaireInstanceId: req.param('questionnaireInstanceId') } );
  } else {
    res.send(400);
  }
});

app.get('/singleEmployeeQuestionnaireStatus', function(req, res) {
  fullcrumApp.singleEmployeeQuestionnaireStatus(req,res);
});

app.get('/singleEmployeeResults', function(req, res) {
  fullcrumApp.singleEmployeeResults(req,res);
});

app.post('/openQuestionnaire', ensureAuthenticated, ensureHasAccount, function(req, res) {
  if ( req.param('title') ) {
    fullcrumApp.createQuestionnaire( req, res, { companyId: req.user.companyId, title: req.param('title') } );
  } else {
    res.send(400);
  }
});

app.get('/employeeGroupConnections', ensureAuthenticated, ensureHasAccount, function(req, res) {
  if ( req.param('employeeId') ) {
    fullcrumApp.sendCollection('EmployeeGroupConnections', req, res, { employeeId: req.param('employeeId') } );
  } else {
    res.send(400);
  }
});

app.get('/companies', ensureAuthenticated, ensureFullcrumAdmin, function(req, res) {
  fullcrumApp.sendCollection('Companies', req, res);
});

app.get('/questionnaires', ensureAuthenticated, ensureFullcrumAdmin, function(req, res) {
  fullcrumApp.sendCollection('Questionnaires', req, res);
});

app.get('/categories', ensureAuthenticated, ensureFullcrumAdmin, function(req, res) {
  if ( req.param('questionnaireId') ) {
    fullcrumApp.sendCollection('Categories', req, res, { questionnaireId: req.param('questionnaireId') } );
  } else {
    res.send(400);
  }
});

app.get('/summaryResponses', ensureAuthenticated, ensureFullcrumAdmin, function(req, res) {
  if ( req.param('questionnaireId') ) {
    fullcrumApp.sendCollection('SummaryResponses', req, res, { questionnaireId: req.param('questionnaireId') } );
  } else {
    res.send(400);
  }
});

app.get('/questions', function(req, res) {
  if ( req.param('categoryId') ) {
    fullcrumApp.sendCollection('Questions', req, res, { categoryId: req.param('categoryId') } );
  } else if ( req.param('companyId') ) {
    var results = [];
    fullcrum.db.connection
      .then( function() {
        return fullcrum.db.collection( 'Companies' )
          .then( function( collection ) {
            return fullcrum.db.collectionFindOneById( collection, req.param('companyId') );
          });
      })
      .then( function( company ) {
        return fullcrum.db.collection( 'Categories' ) 
          .then( function( collection ) {
            return fullcrum.db.collectionFind( collection, { questionnaireId: company.questionnaireId } );
          }); 
      })
      .then( Qx.map( function( category ) {
        return fullcrum.db.collection( 'Questions' )
          .then( function( collection ) {
            return fullcrum.db.collectionFind( collection, { categoryId: category._id.toHexString() } );
          });  
      }))
      .then( Qx.map( function( questions ) {
        results = results.concat( questions );
      })) 
      .then( function() {
        res.send( 200, results );
      })
      .fail( function( err ) {
        res.send( 400, err.toString() );
      });
      
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

app.get('/additionalSuggestions', ensureAuthenticated, ensureFullcrumAdmin, function(req, res) {
  if ( req.param('categoryId') ) {
    var query = { categoryId: req.param('categoryId') };
    if ( req.param('companyId') ) {
      query.companyId = req.param('companyId');
    }
    fullcrumApp.sendCollection('AdditionalSuggestions', req, res, query);
  } else {
    res.send(400);
  }
});

app.post('/save', ensureAuthenticated, ensureHasAccount, function(req, res) {
  fullcrumApp.save( req, res );
});

app.post('/results', function(req, res) {
  fullcrumApp.saveQuestionnaireResults( req, res, req.body.results );
});

app.post('/startQuestionnaire', function(req, res) {
  fullcrumApp.startQuestionnaire( req, res, req.body );
});

app.get('/closedQuestionnaireInstances', ensureAuthenticated, ensureHasAccount, function(req, res) {
  fullcrumApp.sendCollection( 'QuestionnaireInstances', req, res, { companyId: req.user.companyId, state: 'kClosed' } );
});

app.get('/questionnaireInstanceResultsByCategory', ensureAuthenticated, ensureHasAccount, function(req, res) {
  if ( req.param('questionnaireInstanceId') ) {
    fullcrumApp.questionnaireInstanceResultsByCategory( req, res ); 
  } else {
    res.send(400);
  }
});

app.get('/download', ensureAuthenticated, ensureHasAccount, function( req, res ) {
  if ( req.param('questionnaireInstanceId') ) {
    fullcrumApp.download( req, res );
  } else {
    res.send(400);
  }
});

// find private -type d
var privateDirectories = [
  "admin",
  "admin/firstSteps",
  "admin/administrators",
  "admin/administrators/admin",
  "admin/companies",
  "admin/companies/company",
  "admin/results",
  "admin/results/closedQuestionnaireInstance",
  "admin/results/closedQuestionnaireInstance/resultsByCategory",
  "admin/results/closedQuestionnaireInstance/resultsByCategory/resultCategory",
  "admin/results/closedQuestionnaireInstance/resultsByCategory/resultCategory/resultCategoryQuestion",
  "admin/results/closedQuestionnaireInstance/resultsByEmployeeGroup",
  "admin/results/closedQuestionnaireInstance/resultsByEmployeeGroup/resultEmployeeGroup",
  "admin/employeeGroups",
  "admin/employeeGroups/employeeGroup",
  "admin/status",
  "admin/questionnaires",
  "admin/questionnaires/questionnaire",
  "admin/questionnaires/questionnaire/categories",
  "admin/questionnaires/questionnaire/categories/category",
  "admin/questionnaires/questionnaire/categories/category/additionalSuggestions",
  "admin/questionnaires/questionnaire/categories/category/additionalSuggestions/additionalSuggestion",
  "admin/questionnaires/questionnaire/categories/category/questions",
  "admin/questionnaires/questionnaire/categories/category/questions/question",
  "admin/questionnaires/questionnaire/categories/category/suggestions",
  "admin/questionnaires/questionnaire/categories/category/suggestions/suggestion",
  "admin/questionnaires/questionnaire/categories/category/responses",
  "admin/questionnaires/questionnaire/categories/category/responses/response",
  "admin/questionnaires/questionnaire/summaryResponses",
  "admin/questionnaires/questionnaire/summaryResponses/summaryResponse",
  "admin/employees",
  "admin/employees/employee",
  "admin/employees/employee/employeeGroupConnections",
  "admin/employees/employee/employeeGroupConnections/employeeGroupConnection"
];

privateDirectories.forEach( function( directory ) {
  app.get( '/' + directory + '/:file', ensureAuthenticated, ensureHasAccount, function(req, res, next) {
    res.sendfile( 'private/' + directory + '/' + req.param('file') );
  });
});

fullcrumApp.start();
