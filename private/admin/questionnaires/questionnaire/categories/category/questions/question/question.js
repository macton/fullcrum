app.controller('questions-question', function($scope) {
  handleOpenClose( $scope );
  handleOpenIsNew( $scope, 'question' );
  handleEdit( $scope, 'Questions', 'question', 'text', 'categoryId', $scope.category._id );
});

