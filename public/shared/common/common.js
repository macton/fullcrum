angular.module('ng').run(['$rootScope', function($rootScope) {

  $rootScope.isServerError = false;

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

  $rootScope.serverError = function( err ) {
    $rootScope.safeApply( function() {
      console.log( err );
      $rootScope.isServerError   = true;
      $rootScope.serverErrorText = err.status + ' ' + err.statusText + ' ' + err.responseText;
    });
  };

  $rootScope.cachePromises = { };
  $rootScope.cache = function( collectionName, id, gather ) {
    if (!$rootScope.cachePromises.hasOwnProperty( collectionName )) {
      $rootScope.cachePromises[ collectionName ] = {};
    }
    if (!$rootScope.cachePromises[ collectionName ].hasOwnProperty( id )) {
      $rootScope.cachePromises[ collectionName ][ id ] = gather();
    }
    return $rootScope.cachePromises[ collectionName ][ id ];
  };

  $rootScope.isEdited           = false;
  $rootScope.documentFieldEdits = {}; /* { collectionName: { documentId: { fieldName: fieldValue, ... }, ... }, ... } */
  $rootScope.documentDeletes    = {}; /* { collectionName: [ documentId, ... ], ... } */
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
  };

  $rootScope.deleteDocument = function( collectionName, documentId ) {
    var collectionDeletes = $rootScope.documentDeletes[ collectionName ];
    if (!collectionDeletes) {
      collectionDeletes = $rootScope.documentDeletes[ collectionName ] = [];
    }
    collectionDeletes.push( documentId );
    $rootScope.isEdited = true;
  }

  $rootScope.save = function( collectionName, documentId, document ) {

    if ( collectionName && documentId && document ) {
      var documentFieldEdits = {};
      documentFieldEdits[ collectionName ] = {};
      documentFieldEdits[ collectionName ][ documentId ] = document;
      return Q.when( $.post( '/save', { edit: documentFieldEdits } ) );
    }

    $rootScope.isSaving = true;
    $rootScope.safeApply( function() {
      Q.when( $.post( '/save', { edit: $rootScope.documentFieldEdits, delete: $rootScope.documentDeletes } ) )
        .then( function( results ) {
          console.dir( results );
          $rootScope.isEdited           = false;
          $rootScope.documentFieldEdits = {};
          $rootScope.documentDeletes    = {};
        })
        .fail( function( err ) {
          console.dir( err );
        })
        .done( function() {
          $rootScope.safeApply( function() {
            $rootScope.isSaving = false;
          });
        });
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
      $scope[ docName ].$isEdit = true;
      delete $scope[ docName ].$isNew;
    }
  });
}

function sureConfirm( text ) {
  var val1 = Math.floor((Math.random()*10)+1);
  var val2 = Math.floor((Math.random()*10)+1);
  var result = prompt( text + '\n\nIf you are sure you want to continue, enter the answer.\n\nWhat is ' + val1 + ' + ' + val2 + '?' ); 
  return ( (result|0) == (val1+val2) );
}

function handleRemove( $scope, collectionName, arrayName, arrayIndexRef ) {
  $scope.remove = function() { 
    var docArray = $scope[ arrayName ];
    var index    = $scope[ arrayIndexRef ];
    var doc      = docArray[ index ];
    var docId    = doc._id;

    if ( doc.$isNew ) {
      docArray.splice( index, 1 );
      return; 
    }
   
    if ( sureConfirm('This will permanently delete this value and all associated values from our database.')  ) {
      $scope.safeApply( function() {
        $scope.deleteDocument( collectionName, docId );
        docArray.splice( index, 1 );
      });
    }
  };
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
    .fail( function( err ) {
      $scope.serverError( err );
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

function handleAddNew( $scope, collectionName, defaults ) {
  $scope.addNew = function() {
    $scope.safeApply( function() {
      var newDocument        = $.extend( {}, defaults );
      var objectId           = new ObjectId();
      newDocument['_id']     = objectId.toString();
      newDocument['$isNew']  = true;
      newDocument['$isEdit'] = true;
      $scope[ collectionName ].unshift( newDocument );
    });
  };
}
