app.controller('todoItem', function($scope) {
  handleOpenClose( $scope );
  handleRemove( $scope, 'Todos', 'todoItems', '$index' );
  handleEdit( $scope, 'Todos', 'todoItem', 'adminId', 'type', 'kAssigned' );
  handleEdit( $scope, 'Todos', 'todoItem', 'text', 'type', 'kAssigned' );
});

