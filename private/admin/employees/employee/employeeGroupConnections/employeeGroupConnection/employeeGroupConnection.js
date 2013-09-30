app.controller('employeeGroupConnections-employeeGroupConnection', function($scope) {
  handleOpenClose( $scope );
  handleOpenIsNew( $scope, 'employeeGroupConnection' );
  handleEdit( $scope, 'EmployeeGroupConnections', 'employeeGroupConnection', 'employeeGroupId', 'employeeId', $scope.employee._id );
});

