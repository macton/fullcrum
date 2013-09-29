app.controller('companies', function($scope) {
  handleOpenClose( $scope );
  handleAddNew( $scope, 'companies', { name: 'New Company' } );
});

