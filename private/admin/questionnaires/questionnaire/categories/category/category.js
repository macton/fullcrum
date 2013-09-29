app.controller('categories-category', function($scope) {
  handleOpenClose( $scope );
  handleOpenIsNew( $scope, 'category' );
  handleEdit( $scope, 'Questionnaires', 'category', 'name' );

  handleGetCollection( $scope, '/questions',   'questions',   { categoryId: $scope.category._id } );
  handleGetCollection( $scope, '/responses',   'responses',   { categoryId: $scope.category._id } );
  handleGetCollection( $scope, '/suggestions', 'suggestions', { categoryId: $scope.category._id } );

  handlePostSaveCleanup( $scope, [ 'questions', 'responses' ] );
});

