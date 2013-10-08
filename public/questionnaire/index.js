var app = angular.module('app', [], function($locationProvider) {
  $locationProvider.html5Mode(true).hashPrefix('!');
});

app.controller('main', ['$scope', '$location', function ($scope, $location) {

  $scope.companyId               = $location.search()['cid'];
  $scope.questionnaireInstanceId = $location.search()['qid'];
  $scope.employeeId              = $location.search()['uid'];

  if (!( $scope.companyId && $scope.questionnaireInstanceId && $scope.employeeId )) {
    window.location.replace("/");
  }

  $scope.appState = 'kSplash'; 
  $scope.isAppState = function( state ) {
    return $scope.appState === state;
  };
  $scope.setAppState = function( state ) {
    $scope.safeApply( function() {
      $scope.appState = state;
    });
  };

  $scope.next = function() {
    var nextState = {
      'kSplash' : 'kQuestionnaire'
    };
    $scope.safeApply( function() {
      $scope.appState = nextState[ $scope.appState ];
    });
  };

  handleGetCollection( $scope, '/questions', 'questions', { companyId: $scope.companyId } );

}]);


