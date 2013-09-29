app.controller('additionalSuggestions', function($scope) {
  handleOpenClose( $scope );

  $scope.addNew = function() {
    var fakeId = '#' + guid();
    $scope.additionalSuggestions.unshift( { text: 'New Suggestion', _id: fakeId, '$isNew': true, '$isEdit': true } );
    $scope.safeApply();
  }

});

