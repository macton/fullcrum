app.controller('resultEmployeeGroup', function($scope) {
  handleOpenClose( $scope );
  handleGetCollection( $scope, '/questionnaireInstanceResultsByCategory', 'questionnaireInstanceResultsByCategory', { questionnaireInstanceId: $scope.closedQuestionnaireInstance._id, employeeGroupId: $scope.employeeGroup._id } );
});

