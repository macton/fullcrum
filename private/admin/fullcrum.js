var app = angular.module('app', [], function($locationProvider) {
  $locationProvider.html5Mode(true).hashPrefix('!');
});

app.controller('main', function($scope) {

  Q.when( $.get('/adminInfo') )
    .then( function( results ) {
      $scope.userName              = results.userName;
      $scope.userCompanyId         = results.userCompanyId;
      $scope.masterQuestionnaireId = results.masterQuestionnaireId;

      // keep masterQuestionnaire for questionnaires.fork()
      $scope.$watch('questionnaires', function( questionnaires ) { 
        var questionnaireCount = questionnaires.length;
        var i;
        for (i=0;i<questionnaireCount;i++) {
          if ( questionnaires[i]._id == $scope.masterQuestionnaireId ) {
            $scope.masterQuestionnaire = questionnaires[i];
            break;
          }
        }
      });

      handleGetCollection( $scope, '/administrators', 'administrators' );
      handleGetCollection( $scope, '/companies', 'companies' );
      handleGetCollection( $scope, '/questionnaires', 'questionnaires' );
      handleGetCollection( $scope, '/employees', 'employees' );
      handleGetCollection( $scope, '/employeeGroups', 'employeeGroups' );
      handleGetCollection( $scope, '/closedQuestionnaireInstances', 'closedQuestionnaireInstances' );
      handlePostSaveCleanup( $scope, [ 'administrators', 'companies', 'questionnaires', 'employees', 'employeeGroups' ] );

    })
    .done();

  $scope.refreshResults = function() {
    handleGetCollection( $scope, '/closedQuestionnaireInstances', 'closedQuestionnaireInstances' );
  };
});


