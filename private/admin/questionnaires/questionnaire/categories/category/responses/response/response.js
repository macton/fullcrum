app.controller('responses-response', function($scope) {
  handleOpenClose( $scope );
  handleOpenIsNew( $scope, 'response' );
  handleEdit( $scope, 'SummaryResponses', 'response', 'text' );
  handleEdit( $scope, 'SummaryResponses', 'response', 'responseType' );
});

