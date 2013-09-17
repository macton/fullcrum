var fs             = require('fs');
var Q              = require('q');
var fullcrumConfig = require('./fullcrum.config');
var mongoq         = require('./mongoq');

var fullcrumDb = mongoq.Db( fullcrumConfig.mongoDbUrl );

fullcrumDb.connect()
  .then( function( results ) {
    console.log( 'OPEN COLLECTIONS...' );
    return fullcrumDb.collection( fullcrumConfig.collectionNames );
  })
  .then( function( results ) {
    console.log( 'DROP COLLECTIONS...' );
    return fullcrumDb.drop( results );
  })
  .then( function( results ) {
    console.dir( results );
    console.log( 'CLOSE...' );
    return fullcrumDb.close();
  })
  .then( function( ) {
    console.log( 'DONE.');
    process.exit();
  })
  .fail( function( err ) {
    console.log( err );
    console.log( err.stack );
    process.exit();
  });
