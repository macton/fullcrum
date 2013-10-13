app.controller('resultCategoryQuestion', function($scope) {
  handleOpenClose( $scope );

  $scope.$watch( 'resultCategoryQuestion', function() {
    var fullWidth = 530;
    var sum       = $scope.resultCategoryQuestion.stronglyDisagreeCount
                  + $scope.resultCategoryQuestion.disagreeCount
                  + $scope.resultCategoryQuestion.neutralCount
                  + $scope.resultCategoryQuestion.agreeCount
                  + $scope.resultCategoryQuestion.stronglyAgreeCount;

    $scope.stronglyDisagreeBarStyle = function() {
      var ratio = $scope.resultCategoryQuestion.stronglyDisagreeCount / sum;
      var width = ratio * fullWidth;
      return {
        'width': width + 'px'
      }
    };

    $scope.disagreeBarStyle = function() {
      var ratio = $scope.resultCategoryQuestion.disagreeCount / sum;
      var width = ratio * fullWidth;
      return {
        'width': width + 'px'
      }
    };

    $scope.neutralBarStyle = function() {
      var ratio = $scope.resultCategoryQuestion.neutralCount / sum;
      var width = ratio * fullWidth;
      return {
        'width': width + 'px'
      }
    };

    $scope.agreeBarStyle = function() {
      var ratio = $scope.resultCategoryQuestion.agreeCount / sum;
      var width = ratio * fullWidth;
      return {
        'width': width + 'px'
      }
    };

    $scope.stronglyAgreeBarStyle = function() {
      var ratio = $scope.resultCategoryQuestion.stronglyAgreeCount / sum;
      var width = ratio * fullWidth;
      return {
        'width': width + 'px'
      }
    };
  
  });

});

