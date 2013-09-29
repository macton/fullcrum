app.controller('suggestions', function($scope) {
  handleOpenClose( $scope );

  $scope.addNew = function() {
    var fakeId = '#' + guid();
    $scope.suggestions.unshift( { text: 'New Suggestion', _id: fakeId, '$isNew': true, '$isEdit': true } );
    $scope.safeApply();
  }

});

