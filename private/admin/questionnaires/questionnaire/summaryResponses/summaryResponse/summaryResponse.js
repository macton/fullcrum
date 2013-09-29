app.controller('summaryResponses-summaryResponse', function($scope) {
  handleOpenClose( $scope );
  handleOpenIsNew( $scope, 'summaryResponse' );
  handleEdit( $scope, 'SummaryResponses', 'summaryResponse', 'text' );
  handleEdit( $scope, 'SummaryResponses', 'summaryResponse', 'summaryType' );
});

