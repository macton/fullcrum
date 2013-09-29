app.controller('questionnaires', function($scope) {
  handleOpenClose( $scope );
  handleAddNew( $scope, 'questionnaires', { name: 'New Questionnaire' } );
});

