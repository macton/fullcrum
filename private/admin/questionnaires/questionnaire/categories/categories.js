app.controller('categories', function($scope) {
  handleOpenClose( $scope );
  handleAddNew( $scope, 'categories', { name: 'New Category' } );
});

