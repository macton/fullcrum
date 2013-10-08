var fs               = require('fs');
var Q                = require('q');
var fullcrumConfig   = require('./fullcrum.config');
var mongoq           = require('./mongoq');
var fullcrumMaster = {}
var collectionName   = process.argv[2];
if ( !collectionName ) {
  console.log( process.argv[1] + ' <collection_name>' );
  return;
}

var fullcrumDb = mongoq.Db( fullcrumConfig.mongoDbUrl );

fullcrumDb.connect()
  .then( function( results ) {
    console.log('# connected to ' + fullcrumConfig.mongoDbUrl );
    return fullcrumDb.collection( collectionName )
  })
  .then( function( results ) {
    console.log('# opened collection ' + collectionName );
    return fullcrumDb.collectionDrop( results );
  })
  .then( function( results ) {
    console.log('# dropped collection ' + collectionName );
    console.log( results );
  })
  .fail( function( err ) {
    console.log( err );
    console.log( err.stack );
  })
  .done( function() {
    process.exit();
  });
