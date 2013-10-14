app.controller('closedQuestionnaireInstance', function($scope) {
  handleOpenClose( $scope );
  handleRemove( $scope, 'QuestionnaireInstances', 'closedQuestionnaireInstances', '$index' );
});

