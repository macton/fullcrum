app.controller('employeeGroups-employeeGroup', function($scope) {
  handleOpenClose( $scope );
  handleOpenIsNew( $scope, 'employeeGroup' );
  handleRemove( $scope, 'EmployeeGroups', 'employeeGroups', '$index' );
  handleEdit( $scope, 'EmployeeGroups', 'employeeGroup', 'name', 'companyId', $scope.userCompanyId );
});

