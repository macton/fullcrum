app.controller('employees-employee', function($scope) {
  handleOpenClose( $scope );
  handleOpenIsNew( $scope, 'employee' );
  handleEdit( $scope, 'Employees', 'employee', 'name', 'companyId', $scope.userCompanyId );
  handleEdit( $scope, 'Employees', 'employee', 'email', 'companyId', $scope.userCompanyId );
  handleEdit( $scope, 'Employees', 'employee', 'companyId', 'companyId', $scope.userCompanyId );
});

