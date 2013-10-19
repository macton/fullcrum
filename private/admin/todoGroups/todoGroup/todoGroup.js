app.controller('todoGroup', function($scope) {
  handleOpenClose( $scope );
  handleGetCollection( $scope, '/todo', 'todoItems', { assignedId: $scope.todoGroup.id } );

  $scope.$watch( 'isSaving', function( isSaving, wasSaving ) {
    // #todo reduce this so that it only reloads if todoItems have been saved (now reloads on any save)
    if ( wasSaving && (!isSaving) ) {
      handleGetCollection( $scope, '/todo', 'todoItems', { assignedId: $scope.todoGroup.id } );
    }
  });
});

