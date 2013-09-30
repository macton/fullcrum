app.controller('responses-response', function($scope) {
  handleOpenClose( $scope );
  handleRemove( $scope, 'Responses', 'responses', '$index' );
  handleOpenIsNew( $scope, 'response' );
  handleEdit( $scope, 'Responses', 'response', 'text', 'categoryId', $scope.category._id );
  handleEdit( $scope, 'Responses', 'response', 'responseType', 'categoryId', $scope.category._id );
});

