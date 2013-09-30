app.controller('additionalSuggestions-additionalSuggestion', function($scope) {
  handleOpenClose( $scope );
  handleOpenIsNew( $scope, 'additionalSuggestion' );
  handleRemove( $scope, 'AdditionalSuggestions', 'additionalSuggestions', '$index' );
  handleEdit( $scope, 'AdditionalSuggestions', 'additionalSuggestion', 'text', 'categoryId', $scope.category._id );
  handleEdit( $scope, 'AdditionalSuggestions', 'additionalSuggestion', 'authorEmail', 'categoryId', $scope.category._id );
  handleEdit( $scope, 'AdditionalSuggestions', 'additionalSuggestion', 'moreInfoUrl', 'categoryId', $scope.category._id );
  handleEdit( $scope, 'AdditionalSuggestions', 'additionalSuggestion', 'responseType', 'categoryId', $scope.category._id );
  handleEdit( $scope, 'AdditionalSuggestions', 'additionalSuggestion', 'companyId', 'categoryId', $scope.category._id );
});

