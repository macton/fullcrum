app.controller('companies', function($scope) {
  handleOpenClose( $scope );

  $scope.addNew = function() {
    $scope.safeApply( function() {
      var fakeId = '#' + guid();
      $scope.companies.unshift( { name: 'New Company', _id: fakeId, '$isNew': true, '$isEdit': true } );
    });
  }

});

