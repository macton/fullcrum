
var fullcrum = require('./fullcrum.api');
var Qx       = require('qx');

fullcrum.db.connection.then( function() {
  return fullcrum.db.collection('Todos');
})
.then( function( collection ) {
  return fullcrum.db.collectionFind( collection );
})
.then( Qx.map( function( result ) {
  console.log( result.text );
}))
.done( function() {
  fullcrum.db.close();
});
