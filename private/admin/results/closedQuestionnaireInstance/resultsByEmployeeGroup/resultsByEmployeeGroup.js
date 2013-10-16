app.controller('resultsByEmployeeGroup', function($scope) {
  handleOpenClose( $scope );
  handleGetCollection( $scope, '/employeeGroups', 'employeeGroups' );
});

