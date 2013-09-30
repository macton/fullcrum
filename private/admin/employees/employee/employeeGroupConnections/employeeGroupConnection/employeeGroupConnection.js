app.controller('employeeGroupConnections-employeeGroupConnection', function($scope) {
  handleOpenClose( $scope );
  handleOpenIsNew( $scope, 'employeeGroupConnection' );
  handleRemove( $scope, 'EmployeeGroupConnections', 'employeeGroupConnections', '$index' );
  handleEdit( $scope, 'EmployeeGroupConnections', 'employeeGroupConnection', 'employeeGroupId', 'employeeId', $scope.employee._id );
});

