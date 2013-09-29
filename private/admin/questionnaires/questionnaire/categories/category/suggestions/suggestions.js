app.controller('suggestions', function($scope) {
  handleOpenClose( $scope );
  handleAddNew( $scope, 'suggestions', { text: 'New suggestion' } );
});

