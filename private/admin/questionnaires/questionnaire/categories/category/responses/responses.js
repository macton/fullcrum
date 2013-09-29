app.controller('responses', function($scope) {
  handleOpenClose( $scope );

  $scope.addNew = function() {
    var fakeId = '#' + guid();
    $scope.responses.unshift( { text: 'New Response', _id: fakeId, '$isNew': true, '$isEdit': true } );
    $scope.safeApply();
  }

});

