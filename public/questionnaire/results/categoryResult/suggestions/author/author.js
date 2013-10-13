app.controller('author', function($scope) {
  handleOpenClose( $scope );

  $scope.cache( 'authorProfile', $scope.suggestion.authorEmail, function() {
    var emailHash = $.md5( $scope.suggestion.authorEmail );
    return Q.when( $.ajax('http://en.gravatar.com/' + emailHash + '.json', { dataType: 'jsonp' } ) )
      .then( function( results ) {
        console.log( results.entry[0] );
        return results;
      });
  })
  .then( function( results ) {
    $scope.safeApply( function() {
      $scope.profile = results.entry[0];
    });
  })
  .fail( function( err ) {
    $scope.serverError( err );
  });


});

