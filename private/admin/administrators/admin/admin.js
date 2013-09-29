app.controller('administrators-admin', function($scope) {
  handleOpenClose( $scope );
  handleOpenIsNew( $scope, 'admin' );
  handleEdit( $scope, 'Admins', 'admin', 'name' );
  handleEdit( $scope, 'Admins', 'admin', 'email' );
  handleEdit( $scope, 'Admins', 'admin', 'companyId' );
});

