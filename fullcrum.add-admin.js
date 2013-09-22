
function addAdmin( fullcrumDb, admin ) {
  return fullcrumDb.connection
    .then( function( results ) {
      return fullcrumDb.collection( 'Admins' );
    })
    .then( function( collection ) {
      fullcrumDb.collectionFindOne( collection, { email: email } )
        .then( function( prevAdmin ) {
          if ( prevAdmin ) {
            throw new Error('Account already exists');
          }
        })
        .then( function() {
          if (!admin.email) {
            throw new Error('Email required for new account');
          }
          if (!admin.name) {
            throw new Error('Name required for new account');
          }
          if (!admin.companyId) {
            throw new Error('companyId required for new account');
          }

          return fullcrumDb.collectionInsert( collection, { name: name, email: email } );
        });
    });
}

if (require.main === module) {
  var mongoq         = require('./mongoq');
  var fullcrumConfig = require('./fullcrum.config');
  var fullcrumDb     = mongoq.Db( fullcrumConfig.mongoDbUrl );

  var admin = {
    email:     process.argv[2],
    name:      process.argv[3],
    companyId: process.argv[4] 
  };
  
  addAdmin( fullcrumDb, admin )
    .then( function( results ) {
      console.dir( results );
    })
    .fail( function( err ) {
      console.log( process.argv[1] + ' <email> <name> <companyId>');
      console.log( err );
    })
    .done( function() {
      fullcrumDb.close();
    });

} else {
  exports.main = function( fullcrumDb ) {
    return function( admin ) {
      return addAdmin( fullcrumDb, admin );
    };
  }
}
