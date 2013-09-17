var fs             = require('fs');
var Q              = require('q');
var fullcrumConfig = require('./fullcrum.config');
var mongoq         = require('./mongoq');

var fullcrumDb = mongoq.Db( fullcrumConfig.mongoDbUrl );
var name       = process.argv[2];

if (!name) {
  console.log( process.argv[1] + " <company_name>" );
  process.exit();
}

fullcrumDb.connect()
  .then( function( results ) {
    return fullcrumDb.collection( 'Companies' );
  })
  .then( function( collection ) {
    return fullcrumDb.collectionSave( collection, { name: name } );
  })
  .then( function( results ) {
    console.dir( results );
    console.log( 'ADDED COMPANY name=' + name );
    return fullcrumDb.close();
  })
  .fail( function( err ) {
    console.log( err );
    console.log( err.stack );
    process.exit();
  });
