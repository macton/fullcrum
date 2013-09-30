app.controller('employeeGroups-employeeGroup', function($scope) {
  handleOpenClose( $scope );
  handleOpenIsNew( $scope, 'employeeGroup' );
  handleEdit( $scope, 'EmployeeGroups', 'employeeGroup', 'name', 'companyId', $scope.userCompanyId );
});

