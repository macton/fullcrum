app.controller('author', function($scope) {
  handleOpenClose( $scope );

  var emailHash = $.md5( $scope.suggestion.authorEmail );

  Q.when( $.ajax('http://en.gravatar.com/' + emailHash + '.json', { dataType: 'jsonp' } ) )
    .then( function( results ) {
      $scope.safeApply( function() {
        $scope.profile = results.entry[0];
        console.log( $scope.profile );
      });
    })
    .fail( function( err ) {
      $scope.serverError( err );
    });

});

