app.controller('questions-question', function($scope) {
  handleOpenClose( $scope );
  handleRemove( $scope, 'Questions', 'questions', '$index' );
  handleOpenIsNew( $scope, 'question' );
  handleEdit( $scope, 'Questions', 'question', 'text', 'categoryId', $scope.category._id );
});

