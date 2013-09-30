app.controller('employees-employee', function($scope) {
  handleOpenClose( $scope );
  handleOpenIsNew( $scope, 'employee' );
  handleRemove( $scope, 'Employees', 'employees', '$index' );
  handleEdit( $scope, 'Employees', 'employee', 'name', 'companyId', $scope.userCompanyId );
  handleEdit( $scope, 'Employees', 'employee', 'email', 'companyId', $scope.userCompanyId );

  handleGetCollection( $scope, '/employeeGroupConnections', 'employeeGroupConnections', { employeeId: $scope.employee._id } );
  handlePostSaveCleanup( $scope, [ 'employeeGroupConnections' ] );
});

