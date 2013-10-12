var app = angular.module('app', [], function($locationProvider) {
  $locationProvider.html5Mode(true).hashPrefix('!');
});

app.controller('main', ['$scope', '$location', function ($scope, $location) {

  $scope.companyId               = $location.search()['cid'];
  $scope.questionnaireInstanceId = $location.search()['qid'];
  $scope.employeeId              = $location.search()['uid'];
  $scope.appState                = 'kLoading'; 

  $scope.isAppState = function( state ) {
    return $scope.appState === state;
  };
  $scope.setAppState = function( state ) {
    $scope.safeApply( function() {
      $scope.appState = state;
    });
  };

  if (!( $scope.companyId && $scope.questionnaireInstanceId && $scope.employeeId )) {
    window.location.replace("/");
  }

  Q.when( $.get( '/singleEmployeeQuestionnaireStatus', { 
    questionnaireInstanceId: $scope.questionnaireInstanceId, 
    employeeId: $scope.employeeId,
    companyId: $scope.companyId
  }))
  .then( function( result ) {
    console.log( result );
    if ( result.state == 'kCompleted' ) {
      $scope.setAppState('kResults');
      handleGetCollection( $scope, '/singleEmployeeResults', 'results', { companyId: $scope.companyId, employeeId: $scope.employeeId, questionnaireInstanceId: $scope.questionnaireInstanceId } );
    } else {
      $scope.setAppState('kSplash');
      handleGetCollection( $scope, '/questions', 'questions', { companyId: $scope.companyId } );
    }
  })
  .fail( function( err ) {
    $scope.serverError( err );
  });

}]);


