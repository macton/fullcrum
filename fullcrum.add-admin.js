var fs             = require('fs');
var Q              = require('q');
var fullcrumConfig = require('./fullcrum.config');
var mongoq         = require('./mongoq');

var fullcrumDb = mongoq.Db( fullcrumConfig.mongoDbUrl );
var email      = process.argv[2];
var name       = process.argv[3];

if (!(email && name)){ 
  console.log( process.argv[1] + " <admin_email> <admin_name>" );
  process.exit();
}

fullcrumDb.connect()
  .then( function( results ) {
    return fullcrumDb.collection( 'Admins' );
  })
  .then( function( collection ) {
    return fullcrumDb.collectionSave( collection, { name: name, email: email } );
  })
  .then( function( results ) {
    console.dir( results );
    console.log( 'ADDED ADMIN email=' + email + ' name=' + name );
    return fullcrumDb.close();
  })
  .fail( function( err ) {
    console.log( err );
    console.log( err.stack );
    process.exit();
  });
