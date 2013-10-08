var app = angular.module('app', [], function($locationProvider) {
  $locationProvider.html5Mode(true).hashPrefix('!');
});

app.controller('main', ['$scope', '$location', function ($scope, $location) {

  $scope.isError = false;
  $scope.isConnecting = false;

  $scope.connect = function() {
    var accountCode = $('.account-code').val().trim();
    $scope.safeApply( function() {
      $scope.isConnecting = true;
    });
    Q.when($.post( '/account-connect', { accountCode: accountCode } ))
      .then( function( results ) {
        window.location.replace('/');
      })
      .fail( function( err ) { 
        $scope.safeApply( function() {
          $scope.isError = true;
        });
        console.dir( err );
      })
      .done( function() {
        $scope.safeApply( function() {
          $scope.isConnecting = false;
        });
      });
  };

}]);

