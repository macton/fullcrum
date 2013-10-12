app.controller('questionnaire', function($scope) {
  var questionnaireInstanceId = $scope.questionnaireInstanceId;
  var employeeId              = $scope.employeeId;
  var companyId               = $scope.companyId;
  var questionNdx             = 0;
  $scope.results              = [];

  Q.when( $.post('/startQuestionnaire', { employeeId: employeeId, companyId: companyId, questionnaireInstanceId: questionnaireInstanceId } ) )
    .then( function( result ) {
      console.log( result );
    })
    .fail( function( err ) {
      $scope.serverError( err );
    });

  $scope.submit = function() {
    var questionnaireResults    = { results: [] };
    var resultCount             = $scope.results.length;
    for (var i=0;i<resultCount;i++) {
      questionnaireResults.results.push( { 
        questionnaireInstanceId: questionnaireInstanceId,
        employeeId:              employeeId,
        companyId:               companyId,
        questionId:              $scope.results[i].questionId,
        score:                   $scope.results[i].score
      });
    }
    $scope.setAppState( 'kResults' );

    Q.when( $.post('/results', questionnaireResults ) )
      .then( function( result ) {
        console.log( result );
        window.location.replace("/questionnaire/?cid=" + $scope.companyId + "&uid=" + $scope.employeeId + "&qid=" + $scope.questionnaireInstanceId );
      })
      .fail( function( err ) {
        $scope.serverError( err );
      });
  };

  var setQuestionResult = function( questionNdx, questionScore ) {
    var question = $scope.questions[ questionNdx ];
    $scope.results[ questionNdx ] = {
      questionId:              question._id,       
      score:                   questionScore
    };
  };

  $scope.isEnd = function() {
    return questionNdx === $scope.questions.length;
  };

  $scope.resultBarStyle = function( result ) {
    var colors = { 
      '-2': '#ff2e12',
      '-1': '#ff7d23',
      '0':  '#e1b700',
      '1':  '#78ba00',
      '2':  '#199900'
    };
    return { 
      'height' : '3px',
      'float'  : 'left',
      'width'  : '11.78px',
      'background-color' : colors[result.score]
    };
  };

  $scope.questionText = function() {
    if ( $scope.questions.length == 0 ) {
      return '<i class="icon-spin icon-spinner"></i> Loading questions...';
    }
    return $scope.questions[ questionNdx ].text;
  };

  $scope.questionNumber = function() {
    return questionNdx+1;
  };

  $scope.questionCount = function() {
    return $scope.questions.length;
  };

  $scope.hasBack = function() {
    return questionNdx !== 0;
  };

  $scope.back = function() {
    $scope.safeApply( function() {
      $scope.results.pop();
      questionNdx--;
    });
  };

  $scope.stronglyDisagree = function() {
    $scope.safeApply( function() {
      setQuestionResult( questionNdx, -2 );
      questionNdx++;
    });
  };
  $scope.disagree = function() {
    $scope.safeApply( function() {
      setQuestionResult( questionNdx, -1 );
      questionNdx++;
    });
  };
  $scope.neutral = function() {
    $scope.safeApply( function() {
      setQuestionResult( questionNdx, 0 );
      questionNdx++;
    });
  };
  $scope.agree = function() {
    $scope.safeApply( function() {
      setQuestionResult( questionNdx, 1 );
      questionNdx++;
    });
  };
  $scope.stronglyAgree = function() {
    $scope.safeApply( function() {
      setQuestionResult( questionNdx, 2 );
      questionNdx++;
    });
  };
});
