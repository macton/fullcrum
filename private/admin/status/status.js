app.controller('status', function($scope) {
  handleOpenClose( $scope );

  var d = new Date();

  $scope.isLoading             = false;
  $scope.hasOpenQuestionnaire  = false;
  $scope.newQuestionnaireTitle = 'Questionnaire ' + d.toLocaleDateString();

  $scope.statusStateText = {
    'kUnopened'  : 'Unopened',
    'kUnsent'    : 'Unsent',
    'kStarted'   : 'Started',
    'kCompleted' : 'Complete'
  };

  $scope.statusStateStyle = {
    'kUnopened'  : { padding: '5px' },
    'kUnsent'    : { padding: '5px', color: 'red' },
    'kStarted'   : { padding: '5px', color: 'blue' },
    'kCompleted' : { padding: '5px', color: 'green' }
  };

  var refreshOpenQuestionnaire = function() {
    $scope.isLoading            = true;
    $scope.hasOpenQuestionnaire = false;
    $scope.refreshResults();
    Q.when( $.get('/openQuestionnaire') )
      .then( function( results ) {
        $scope.safeApply( function() {
          if ( results.length > 0 ) {
            $scope.openQuestionnaire = results[0];
            handleGetCollection( $scope, '/employeeQuestionnaireStatus', 'employeeQuestionnaireStatus', { questionnaireInstanceId: $scope.openQuestionnaire._id } );
            $scope.hasOpenQuestionnaire = true;
          }
          $scope.isLoading = false;
        });
      })
      .fail( function( err ) {
        $scope.isLoading = false;
        console.log( err );
      });
  };

  refreshOpenQuestionnaire();

  $scope.begin = function() {
    if ( sureConfirm('This will create your new questionnaire and send an email with a unique URL to each employee.') ) {
      $scope.isLoading = true;
      Q.when( $.post('/openQuestionnaire', { title: $scope.newQuestionnaireTitle } ) )
        .then( function( results ) {
          console.log( results );
        })
        .fail( function( err ) {
          console.log( err );
        })
        .done( function() {
          refreshOpenQuestionnaire();        
        });
    }
  };

  $scope.end = function() {
    if ( sureConfirm('This will close your questionnaire and make results available. No further results will be accepted.') ) {
      $scope.isLoading = true;
      $scope.save('QuestionnaireInstances', $scope.openQuestionnaire._id, { state: 'kClosed' })
        .then( function( results ) {
          console.log( results );
          refreshOpenQuestionnaire();        
        })
        .fail( function( err ) {
          $scope.serverError( err );
        });
    }
  };

});

