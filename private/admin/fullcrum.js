var app = angular.module('app', [], function($locationProvider) {
  $locationProvider.html5Mode(true).hashPrefix('!');
});

app.controller('main', function($scope) {

  $scope.todoGroups             = [];
  $scope.fullcrumAdministrators = [];


  var administratorNames = {};
  var companyNames       = {};

  Q.when( $.get('/adminInfo') )
    .then( function( results ) {
      $scope.userName              = results.userName;
      $scope.userCompanyId         = results.userCompanyId;
      $scope.masterQuestionnaireId = results.masterQuestionnaireId;
      $scope.fullcrumCompanyId     = results.fullcrumCompanyId;
      $scope.maxEmployeeCount      = results.maxEmployeeCount;

      // keep masterQuestionnaire for questionnaires.fork()
      $scope.$watch('questionnaires', function( questionnaires ) { 
        var questionnaireCount = questionnaires.length;
        var i;
        for (i=0;i<questionnaireCount;i++) {
          if ( questionnaires[i]._id == $scope.masterQuestionnaireId ) {
            $scope.masterQuestionnaire = questionnaires[i];
            break;
          }
        }
      });

      handleGetCollection( $scope, '/administrators', 'administrators' );
      handleGetCollection( $scope, '/companies', 'companies' );
      handleGetCollection( $scope, '/questionnaires', 'questionnaires' );
      handleGetCollection( $scope, '/employees', 'employees' );
      handleGetCollection( $scope, '/employeeGroups', 'employeeGroups' );
      handleGetCollection( $scope, '/closedQuestionnaireInstances', 'closedQuestionnaireInstances' );
      handlePostSaveCleanup( $scope, [ 'administrators', 'companies', 'questionnaires', 'employees', 'employeeGroups' ] );

      $scope.$watch('administrators', function() {
        $scope.safeApply( function() {
          $scope.fullcrumAdministrators = [];
          $scope.administrators.forEach( function( administrator ) {
            if ( administrator.companyId == $scope.fullcrumCompanyId ) {
              $scope.fullcrumAdministrators.push( administrator );
            }
          });

          $scope.todoGroups = [];
          $scope.todoGroups.push( { name: 'Unassigned Bugs', id: 'kUnassignedBug' } );
          $scope.todoGroups.push( { name: 'Unassigned Suggestions', id: 'kUnassignedSuggestion' } );
          $scope.fullcrumAdministrators.forEach( function( administrator ) {
            $scope.todoGroups.push( { name: administrator.name, id: administrator._id } );
          });
        });
      });

    })
    .done();

  $scope.refreshResults = function() {
    handleGetCollection( $scope, '/closedQuestionnaireInstances', 'closedQuestionnaireInstances' );
  };

  $scope.getAdministratorName = function( administratorId ) {
    if ( !administratorNames.hasOwnProperty( administratorId ) ) {
      var administratorCount = $scope.administrators.length;
      for (var i=0;i<administratorCount;i++) {
        if ( $scope.administrators[i]._id == administratorId ) {
          administratorNames[ administratorId ] = $scope.administrators[i].name;
          return administratorNames[ administratorId ];
        }
      }   
      return 'Unknown Admin';
    }
    return administratorNames[ administratorId ];
  };

  $scope.getCompanyName = function( companyId ) {
    if ( !companyNames.hasOwnProperty( companyId ) ) {
      var companyCount = $scope.companies.length;
      for (var i=0;i<companyCount;i++) {
        if ( $scope.companies[i]._id == companyId ) {
          companyNames[ companyId ] = $scope.companies[i].name;
          return companyNames[ companyId ];
        }
      }   
      return 'Unknown Company';
    }
    return companyNames[ companyId ];
  };

  $scope.todoSentCount = 0;
  $scope.incSentTodo = function() {
    $scope.safeApply( function() {
      $scope.todoSentCount++;
    });
  };
});


