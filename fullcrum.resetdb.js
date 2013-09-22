var fs               = require('fs');
var Q                = require('q');
var fullcrumConfig   = require('./fullcrum.config');
var mongoq           = require('./mongoq');
var fullcrumMaster = {}

var fullcrumDb = mongoq.Db( fullcrumConfig.mongoDbUrl );

fullcrumDb.connect()
  .then( function( results ) {
    console.log( '# DROP COLLECTIONS...' );
    return fullcrumDb.collection( fullcrumConfig.collectionNames )
      .then( function( results ) {
        return fullcrumDb.drop( results );
      });
  })
  .then( function( results ) {
    console.log( '# ADD DEFAULT QUESTIONNAIRE...' );
    return fullcrumDb.collection( 'Questionnaires' )
      .then( function( collection ) {
        return fullcrumDb.collectionInsert( collection, { name: 'Fullcrum Master' } );
      })
      .then( function( results ) {
        console.dir( results );
        fullcrumMaster.questionnaire = results[0];
      });
  })
  .then( function( results ) {
    console.log( '# ADD DEFAULT COMPANY...' );
    return fullcrumDb.collection( 'Companies' )
      .then( function( collection ) {
        return fullcrumDb.collectionInsert( collection, { name: 'Fullcrum', questionnaireId: fullcrumMaster.questionnaire._id.toHexString() } );
      })
      .then( function( results ) {
        console.dir( results );
        fullcrumMaster.company = results[0];
      });
  })
  .then( function( results ) {
    console.log( '# ADD DEFAULT ADMINS...' );
    return fullcrumDb.collection( 'Admins' )
      .then( function( collection ) {
        return fullcrumDb.collectionInsert( collection, { name: 'Mike Acton', email: 'macton@gmail.com', companyId: fullcrumMaster.company._id.toHexString() } );
      })
      .then( function( results ) {
        console.dir( results );
        fullcrumMaster.admin = results[0];
      });
  })
  .then( function( ) {
    console.log( '# SAVE DEFAULTS fullcrum.master.config.js ...' );
    return fullcrumDb.close()
      .then( function() {
        var config = 'exports.admin         = ' + JSON.stringify( fullcrumMaster.admin, null, 2 ) + ';\n'
                   + 'exports.questionnaire = ' + JSON.stringify( fullcrumMaster.questionnaire, null, 2 ) + ';\n'
                   + 'exports.company       = ' + JSON.stringify( fullcrumMaster.company, null, 2 ) + ';\n';
        fs.writeFileSync( 'fullcrum.master.config.js', config, 'utf8' );
        console.log( 'DONE.');
      });
  })
  .fail( function( err ) {
    console.log( err );
    console.log( err.stack );
  })
  .done( function() {
    process.exit();
  });
