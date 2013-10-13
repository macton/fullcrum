app.controller('resultCategory', function($scope) {
  handleOpenClose( $scope );

  $scope.$watch( 'resultCategory', function() {
    $scope.negativeBarStyle = function() {
      var sum   = $scope.resultCategory.negativeCount + $scope.resultCategory.neutralCount + $scope.resultCategory.positiveCount;
      var ratio = $scope.resultCategory.negativeCount / sum;
      var width = ratio * 205;
      return {
        'width': width + 'px'
      }
    };
  
    $scope.neutralBarStyle = function() {
      var sum   = $scope.resultCategory.negativeCount + $scope.resultCategory.neutralCount + $scope.resultCategory.positiveCount;
      var ratio = $scope.resultCategory.neutralCount / sum;
      var width = ratio * 205;
      return {
        'width': width + 'px'
      }
    };
  
    $scope.positiveBarStyle = function() {
      var sum   = $scope.resultCategory.negativeCount + $scope.resultCategory.neutralCount + $scope.resultCategory.positiveCount;
      var ratio = $scope.resultCategory.positiveCount / sum;
      var width = ratio * 205;
      return {
        'width': width + 'px'
      }
    };
  });

});

