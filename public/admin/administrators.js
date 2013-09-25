app.controller('administrators', function($scope) {
  handleOpenClose( $scope );

  $scope.addNew = function() {
    var fakeId = '#' + guid();
    $scope.administrators.unshift( { name: 'New User', _id: fakeId, '$isNew': true, '$isEdit': true } );
    $scope.safeApply();
  }
});

