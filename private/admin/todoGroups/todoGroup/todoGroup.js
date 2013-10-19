app.controller('todoGroup', function($scope) {
  handleOpenClose( $scope );
  handleGetCollection( $scope, '/todo', 'todoItems', { assignedId: $scope.todoGroup.id } );

  $scope.$watch( 'isSaving', function( isSaving, wasSaving ) {
    if ( wasSaving && (!isSaving) ) {
      handleGetCollection( $scope, '/todo', 'todoItems', { assignedId: $scope.todoGroup.id } );
    }
  });
  $scope.$watch( 'todoSentCount', function( todoSentCount, prevTodoSentCount ) {
    if ( todoSentCount != prevTodoSentCount ) {
      handleGetCollection( $scope, '/todo', 'todoItems', { assignedId: $scope.todoGroup.id } );
    }
  });
});

