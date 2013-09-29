app.controller('responses-response', function($scope) {
  handleOpenClose( $scope );
  handleOpenIsNew( $scope, 'response' );
  handleEdit( $scope, 'SummaryResponses', 'response', 'text', 'categoryId', $scope.category._id );
  handleEdit( $scope, 'SummaryResponses', 'response', 'responseType', 'categoryId', $scope.category._id );
});

