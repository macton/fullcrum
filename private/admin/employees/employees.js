app.controller('employees', function($scope) {
  handleOpenClose( $scope );
  handleAddNew( $scope, 'employees', { name: 'New Employee' } );
});

