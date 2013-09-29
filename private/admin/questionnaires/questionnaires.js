app.controller('questionnaires', function($scope) {
  handleOpenClose( $scope );

  $scope.addNew = function() {
    var fakeId = '#' + guid();
    $scope.questionnaires.unshift( { name: 'New Questionnaire', _id: fakeId, '$isNew': true, '$isEdit': true } );
    $scope.safeApply();
  }

});

