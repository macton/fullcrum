app.controller('additionalSuggestions', function($scope) {
  handleOpenClose( $scope );
  handleAddNew( $scope, 'additionalSuggestions', { text: 'New suggestion' } );
});

