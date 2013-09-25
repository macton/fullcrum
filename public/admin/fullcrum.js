var app = angular.module('app', []);

app.controller('main', function($scope) {
  $scope.val = 'Hello';  

  $scope.administrators = [];
  Q.when( $.get('/administrators') )
    .then( function( results ) {
      $scope.administrators = results;
      $scope.safeApply();
    })
    .done();

  $scope.companies = [];
  Q.when( $.get('/companies') )
    .then( function( results ) {
      $scope.companies = results;
      $scope.safeApply();
    })
    .done();
});


