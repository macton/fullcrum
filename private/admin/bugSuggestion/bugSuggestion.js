app.controller('bugSuggestion', function($scope) {
  handleOpenClose( $scope );

  $scope.commentText         = '';
  $scope.isSendingBug        = false;
  $scope.isSendingSuggestion = false;

  var thankYouText        = 'Thank you for your feedback! We\'ll definitely take a look at this.';
  var putSomethingText    = 'Put your bug or suggestion text here.';
  var altPutSomethingText = 'Go ahead and put what\'s on your mind here. We\'re paying attention! Or email us at welovedevs@fullcrum.co';
  var thankYouAgainText   = 'Don\'t worry. We\'ll read it for sure!';

  var sendTodo = function( url ) {
    if ( $scope.commentText.trim() == '' ) {
      $scope.safeApply( function() {
        $scope.commentText  = putSomethingText;
      });
      return;
    }
    if ( $scope.commentText.trim() == putSomethingText ) {
      $scope.safeApply( function() {
        $scope.commentText  = altPutSomethingText;
      });
      return;
    }
    if ( $scope.commentText.trim() == altPutSomethingText ) {
      $scope.safeApply( function() {
        $scope.commentText  = putSomethingText;
      });
      return;
    }
    if ( $scope.commentText.trim() == thankYouText ) {
      $scope.safeApply( function() {
        $scope.commentText  = thankYouAgainText;
      });
      return;
    }
    if ( $scope.commentText.trim() == thankYouAgainText ) {
      $scope.safeApply( function() {
        $scope.commentText  = thankYouText;
      });
      return;
    }
    $scope.isSendingBug = true;
    Q.when( $.post( url, { text: $scope.commentText } ) )
      .then( function() {
        $scope.safeApply( function() {
          $scope.commentText  = thankYouText;
          $scope.isSendingBug = false;
        });
      })
      .fail( function(err) {
        $scope.serverError( err );
      });
  };

  $scope.sendBug = function() {
    sendTodo('/bug');
  };
  $scope.sendSuggestion = function() {
    sendTodo('/suggestion');
  };
});

