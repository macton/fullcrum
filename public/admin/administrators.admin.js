app.controller('administrators-admin', function($scope) {
  handleOpenClose( $scope );

  $scope.$watch('admin.name', function( value, oldValue ) {
    if (value !== oldValue) {
      $scope.editDocumentField('Admins',$scope.admin._id,'name',value);
      $scope.admin.$isEdit = true;
      delete $scope.admin.$isNew;
    }
  });
  $scope.$watch('admin.email', function( value, oldValue ) {
    if (value !== oldValue) {
      $scope.editDocumentField('Admins',$scope.admin._id,'email',value);
      $scope.admin.$isEdit = true;
      delete $scope.admin.$isNew;
    }
  });
  $scope.$watch('admin.companyId', function( value, oldValue ) {
    if (value !== oldValue) {
      $scope.editDocumentField('Admins',$scope.admin._id,'companyId',value);
      $scope.admin.$isEdit = true;
      delete $scope.admin.$isNew;
    }
  });
  $scope.$watch('admin.$isNew', function( value, oldValue ) {
    if ( value ) {
      $scope.isOpen = true;
    }
  });
});

