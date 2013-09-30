app.controller('suggestions-suggestion', function($scope) {
  handleOpenClose( $scope );
  handleOpenIsNew( $scope, 'suggestion' );
  handleRemove( $scope, 'Suggestions', 'suggestions', '$index' );
  handleEdit( $scope, 'Suggestions', 'suggestion', 'text', 'categoryId', $scope.category._id );
  handleEdit( $scope, 'Suggestions', 'suggestion', 'authorEmail', 'categoryId', $scope.category._id );
  handleEdit( $scope, 'Suggestions', 'suggestion', 'moreInfoUrl', 'categoryId', $scope.category._id );
  handleEdit( $scope, 'Suggestions', 'suggestion', 'responseType', 'categoryId', $scope.category._id );
});

