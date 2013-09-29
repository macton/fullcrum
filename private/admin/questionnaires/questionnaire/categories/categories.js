app.controller('categories', function($scope) {
  handleOpenClose( $scope );

  $scope.addNew = function() {
    var fakeId = '#' + guid();
    $scope.categories.unshift( { name: 'New Category', _id: fakeId, '$isNew': true, '$isEdit': true } );
    $scope.safeApply();
  }

});

