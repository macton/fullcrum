app.controller('questions-question', function($scope) {
  handleOpenClose( $scope );
  handleOpenIsNew( $scope, 'question' );
  handleEdit( $scope, 'Questions', 'question', 'text' );
});

