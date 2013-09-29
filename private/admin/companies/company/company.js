app.controller('companies-company', function($scope) {
  handleOpenClose( $scope );
  handleOpenIsNew( $scope, 'company' );
  handleEdit( $scope, 'Companies', 'company', 'name' );
  handleEdit( $scope, 'Companies', 'company', 'questionnaireId' );
});

