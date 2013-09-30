app.controller('employeeGroups', function($scope) {
  handleOpenClose( $scope );
  handleAddNew( $scope, 'employeeGroups', { name: 'New Employee Group' } );
});

