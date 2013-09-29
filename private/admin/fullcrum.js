var app = angular.module('app', [], function($locationProvider) {
  $locationProvider.html5Mode(true).hashPrefix('!');
});

app.controller('main', function($scope) {

  Q.when( $.get('/adminInfo') )
    .then( function( results ) {
      $scope.userName              = results.userName;
      $scope.masterQuestionnaireId = results.masterQuestionnaireId;
    })
    .done();

  handleGetCollection( $scope, '/administrators', 'administrators' );
  handleGetCollection( $scope, '/companies', 'companies' );
  handleGetCollection( $scope, '/questionnaires', 'questionnaires' );
  handlePostSaveCleanup( $scope, [ 'administrators', 'companies', 'questionnaires' ] );

});


