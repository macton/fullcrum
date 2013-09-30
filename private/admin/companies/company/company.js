app.controller('companies-company', function($scope) {
  handleOpenClose( $scope );
  handleOpenIsNew( $scope, 'company' );
  handleRemove( $scope, 'Companies', 'companies', '$index' );
  handleEdit( $scope, 'Companies', 'company', 'name' );
  handleEdit( $scope, 'Companies', 'company', 'questionnaireId' );
});

