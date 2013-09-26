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
