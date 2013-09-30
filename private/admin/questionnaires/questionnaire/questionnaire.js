app.controller('questionnaires-questionnaire', function($scope) {
  handleOpenClose( $scope );
  handleOpenIsNew( $scope, 'questionnaire' );
  handleRemove( $scope, 'Questionnaires', 'questionnaires', '$index' );
  handleEdit( $scope, 'Questionnaires', 'questionnaire', 'name' );

  handleGetCollection( $scope, '/categories', 'categories', { questionnaireId: $scope.questionnaire._id } );
  handleGetCollection( $scope, '/summaryResponses', 'summaryResponses', { questionnaireId: $scope.questionnaire._id } );
  handlePostSaveCleanup( $scope, [ 'categories', 'summaryResponses' ] );
});

