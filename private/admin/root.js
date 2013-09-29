angular.module('ng').run(['$rootScope', function($rootScope) {

  $rootScope.safeApply = function(fn) {
    var phase = this.$root.$$phase;
    if(phase == '$apply' || phase == '$digest') {
      if(fn && (typeof(fn) === 'function')) {
        fn();
      }
    } else {
      this.$apply(fn);
    }
  };

  $rootScope.isEdited           = false;
  $rootScope.documentFieldEdits = {};
  $rootScope.isSaving           = false;

  $rootScope.editDocumentField = function(collectionName, documentId, fieldName, fieldValue) {
    var collectionEdits = $rootScope.documentFieldEdits[ collectionName ];
    if (!collectionEdits) {
      collectionEdits = $rootScope.documentFieldEdits[ collectionName ] = { };
    }
    var documentEdits = collectionEdits[ documentId ];
    if (!documentEdits) {
      documentEdits = collectionEdits[ documentId ] = { }; 
    }
    documentEdits[ fieldName ] = fieldValue;
    $rootScope.isEdited = true;
    console.dir( $rootScope.documentFieldEdits );
  };

  $rootScope.save = function() {
    $rootScope.isSaving = true;
    $rootScope.safeApply();

    Q.when( $.post( '/save', $rootScope.documentFieldEdits ) )
      .then( function( results ) {
        console.dir( results );
        $rootScope.isEdited           = false;
        $rootScope.documentFieldEdits = {};
      })
      .fail( function( err ) {
        console.dir( err );
      })
      .done( function() {
        $rootScope.isSaving = false;
        $rootScope.safeApply();
      });
  };

  $rootScope.responseTypes = [
    { value: 'kPositive', text: 'Category results positive' },
    { value: 'kNeutral',  text: 'Category results neutral' },
    { value: 'kNegative', text: 'Category results negative' },
    { value: 'kAny',      text: 'Any results' }
  ];
  
  $rootScope.summaryTypes = [
    { value: 'kOneNegative', text: 'One category is negative' },
    { value: 'kSomeNegative', text: 'Some categories are negative' },
    { value: 'kAllNegative', text: 'All categories are negative' },
    { value: 'kAllPositive', text: 'All categories are positive' }
  ];

}]);


function handleOpenClose( $scope ) {
  $scope.isOpen = false;
  $scope.open = function() {
    $scope.isOpen = true;
    console.log('open');
  };
  $scope.close = function() {
    $scope.isOpen = false;
    console.log('close');
  };
}

function handleEdit( $scope, collectionName, docName, fieldName, keyName, keyValue ) {
  $scope.$watch( docName + '.' + fieldName, function( value, oldValue ) {
    if (value !== oldValue) {
      $scope.editDocumentField( collectionName, $scope[ docName ]._id, fieldName, value );
      if ( keyName && keyValue ) {
        $scope.editDocumentField( collectionName, $scope[ docName ]._id, keyName, keyValue );
      }
      $scope.questionnaire.$isEdit = true;
      delete $scope[ docName ].$isNew;
    }
  });
}

function handleOpenIsNew( $scope, docName ) {
  $scope.$watch( docName + '.$isNew', function( value, oldValue ) {
    if ( value ) {
      $scope.isOpen = true;
    }
  });
}

var sortByName = function( a, b ) {
  return a.name.localeCompare( b.name );
}

function handleGetCollection( $scope, url, collectionName, data ) {
  $scope[ collectionName ] = [];
  Q.when( $.get( url, data ) )
    .then( function( results ) {
      $scope.safeApply( function() {
        if ( (results.length > 0) && results[0].hasOwnProperty('name') ) {
          results.sort(sortByName);
        }
        $scope[ collectionName ] = results;
      });
    })
    .done();
}


function cleanupPostSave( collection ) {
  var count = collection.length;
  var i;
  for (i=count-1;i>=0;i--) {

    // remove unsaved/unedited new 
    if ( collection[i].$isNew ) {
      collection.splice( i, 1 );
    }

    // unmark edited
    if ( collection[i].$isEdit ) {
      delete collection[i].$isEdit; 
    }
  }
}

function handlePostSaveCleanup( $scope, collectionNames ) {
  $scope.$watch( 'isSaving', function( isSaving, wasSaving ) {
    if ( isSaving && (!wasSaving) ) {
      for (var i=0;i<collectionNames.length;i++) { 
        cleanupPostSave( $scope[ collectionNames[i] ] );
      }
    }
  });
}
