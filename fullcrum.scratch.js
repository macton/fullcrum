
var fullcrum          = require('./fullcrum.api');

fullcrum.db.connection.then( function() {
  return fullcrum.db.collection('Admins');
})
.then( function( collection ) {
  return fullcrum.db.collectionFind( collection );
})
.then( function( results ) {
  console.dir( results );
});
