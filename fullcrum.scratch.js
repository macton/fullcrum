
var fullcrum   = require('./fullcrum.api');
var Qx         = require('qx');
var companyId  = '527d14bb9f86ac03db000000'; // filamentgames.com
var questionnaireInstanceId = '5285024e587a980000000091';

fullcrum.db.connection.then( function() {
  // return fullcrum.db.collection( 'Employees' );
  // return fullcrum.db.collection( 'QuestionnaireInstances' );
  return fullcrum.db.collection('EmployeeQuestionnaireStatus')
})
.then( function( collection ) {
  var results = { state: 'kUnopened', email: 'norton@filamentgames.com', name: 'Dan Norton', questionnaireInstanceId: questionnaireInstanceId, companyId: companyId };
  // return fullcrum.db.collectionFindOne( collection, { email: 'norton@filamentgames.com', companyId: companyId } );
  // return fullcrum.db.collectionFindOne( collection, { companyId: companyId } );
  return fullcrum.db.collectionInsert( collection, results );
})
.then( function( result ) {
  console.log( result );
})
.fail( function( err ) {
  console.log( err.stack );
})
.done( function() {
  fullcrum.db.close();
});

