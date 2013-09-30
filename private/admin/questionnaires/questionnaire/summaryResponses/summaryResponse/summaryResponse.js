app.controller('summaryResponses-summaryResponse', function($scope) {
  handleOpenClose( $scope );
  handleOpenIsNew( $scope, 'summaryResponse' );
  handleRemove( $scope, 'SummaryResponses', 'summaryResponses', '$index' );
  handleEdit( $scope, 'SummaryResponses', 'summaryResponse', 'text', 'questionnaireId', $scope.questionnaire._id );
  handleEdit( $scope, 'SummaryResponses', 'summaryResponse', 'summaryType', 'questionnaireId', $scope.questionnaire._id );
});

