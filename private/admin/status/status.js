app.controller('status', function($scope) {
  handleOpenClose( $scope );

  var d = new Date();

  $scope.isLoading             = false;
  $scope.hasOpenQuestionnaire  = false;
  $scope.newQuestionnaireTitle = 'Questionnaire ' + d.toLocaleDateString();

  $scope.statusStateText = {
    'kUnopened'  : 'Unopened',
    'kUnsent'    : '<span style="color:red;">Unopened</span>',
    'kStarted'   : '<span style="color:blue;">Started</span>',
    'kCompleted' : '<span style="color:green">Complete</span>'
  };

  var refreshOpenQuestionnaire = function() {
    $scope.isLoading            = true;
    $scope.hasOpenQuestionnaire = false;
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

});

