app.controller('suggestions-suggestion', function($scope) {
  handleOpenClose( $scope );
  handleOpenIsNew( $scope, 'suggestion' );
  handleEdit( $scope, 'SummaryResponses', 'suggestion', 'text' );
  handleEdit( $scope, 'SummaryResponses', 'suggestion', 'authorEmail' );
  handleEdit( $scope, 'SummaryResponses', 'suggestion', 'moreInfoUrl' );
  handleEdit( $scope, 'SummaryResponses', 'suggestion', 'responseType' );
});

