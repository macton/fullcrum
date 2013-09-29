app.controller('administrators', function($scope) {
  handleOpenClose( $scope );
  handleAddNew( $scope, 'administrators', { name: 'New User' } );
});

