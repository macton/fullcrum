app.controller('resultsByCategory', function($scope) {
  handleOpenClose( $scope );
  handleGetCollection( $scope, '/questionnaireInstanceResultsByCategory', 'questionnaireInstanceResultsByCategory', { questionnaireInstanceId: $scope.closedQuestionnaireInstance._id } );
});

