app.controller('responses', function($scope) {
  handleOpenClose( $scope );
  handleAddNew( $scope, 'responses', { text: 'New response' } );
});

