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

  var cleanupPostSave = function( collection ) {
    var count = collection.length;
    var i;
    for (i=count-1;i>=0;i--) {

      // remove unsaved/unedited new 
      if ( collection[i].$isNew ) {
        collection.splice( i, 1 );
      }

      // unmark edited
      if ( collection[i].$isEdit ) {
        delete collection[i].$isEdit; 
      }
    }
  }

  $scope.$watch( 'isSaving', function( isSaving, wasSaving ) {
    if ( isSaving && (!wasSaving) ) {
      cleanupPostSave( $scope.administrators );
      cleanupPostSave( $scope.companies );
    }
  });
});


