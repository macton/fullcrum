app.controller('questions', function($scope) {
  handleOpenClose( $scope );

  $scope.addNew = function() {
    var fakeId = '#' + guid();
    $scope.questions.unshift( { text: 'New Question', categoryId: $scope.category._id, _id: fakeId, '$isNew': true, '$isEdit': true } );
    $scope.safeApply();
  }

});

