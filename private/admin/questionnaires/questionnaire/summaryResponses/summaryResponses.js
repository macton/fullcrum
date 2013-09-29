app.controller('summaryResponses', function($scope) {
  handleOpenClose( $scope );

  $scope.addNew = function() {
    var fakeId = '#' + guid();
    $scope.summaryResponses.unshift( { text: 'New Summary Response', questionnaireId: $scope.questionnaire._id, _id: fakeId, '$isNew': true, '$isEdit': true } );
    $scope.safeApply();
  }

});

