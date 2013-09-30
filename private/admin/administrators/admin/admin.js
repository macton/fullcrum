app.controller('administrators-admin', function($scope) {
  handleOpenClose( $scope );
  handleOpenIsNew( $scope, 'admin' );
  handleRemove( $scope, 'Admins', 'administrators', '$index' );
  handleEdit( $scope, 'Admins', 'admin', 'name' );
  handleEdit( $scope, 'Admins', 'admin', 'email' );
  handleEdit( $scope, 'Admins', 'admin', 'companyId' );
});

