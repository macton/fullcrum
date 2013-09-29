app.controller('questions', function($scope) {
  handleOpenClose( $scope );
  handleAddNew( $scope, 'questions', { text: 'New question' } );
});

