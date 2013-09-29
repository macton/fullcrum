app.controller('summaryResponses', function($scope) {
  handleOpenClose( $scope );
  handleAddNew( $scope, 'summaryResponses', { text: 'New summary response' } );
});

