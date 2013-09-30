
var mongodb        = require('mongodb');
var MongoClient    = mongodb.MongoClient;
var Q              = require('q');
var ObjectId       = require('mongodb').ObjectID;
var assert         = require('assert');

var denodeify = function( func ) {
  var deferred = Q.defer();
  func( deferred.makeNodeResolver() );
  return deferred.promise;
}

exports.Db = function( url ) {
  var api = { url: url };

  api.connect = function() {
    return denodeify( function( resolver ) {
      MongoClient.connect( url, resolver )
    })
    .then( function( db ) {
      api.db = db;
      return (api);
    });
  };
 
  api.connection = api.connect();

  api.collectionUpdate = function( collection, query, document ) {
    assert( collection, 'no collection' );
    assert( query,      'no query' );
    assert( document,   'no document' );
    return denodeify( function( resolver ) {
      collection.update( query, document, {w: 1, upsert: true}, resolver );
    });
  };

  api.collectionUpdateById = function( collection, documentId, document ) {
    assert( collection, 'no collection' );
    assert( documentId, 'no documentId' );
    assert( document,   'no document' );
    return denodeify( function( resolver ) {
      collection.update({"_id": new ObjectId( documentId )}, document, {w:1, upsert: true}, resolver );
    });
  };

  api.collectionInsert = function( collection, document ) {
    assert( collection, 'no collection' );
    assert( document,   'no document' );
    return denodeify( function( resolver ) {
      collection.insert( document, {w: 1}, resolver );
    });
  };

  api.collection = function( collectionName ) {
    assert( collectionName, 'no collectionName' );
    var self         = this;
    if ( Array.isArray(collectionName) ) {
      var self         = this;
      var openPromises = [];
      collectionName.forEach( function( name ) {
        openPromises.push( self.collection(name) );  
      });
      return Q.all( openPromises );
    }
    return denodeify( function( resolver ) {
      self.db.collection( collectionName, resolver );
    });
  };

  api.collectionFindOneById = function( collection, documentId ) {
    assert( collection, 'no collection' );
    assert( documentId, 'no documentId' );
    return denodeify( function( resolver ) {
      collection.findOne({"_id": new ObjectId( documentId )}, resolver );
    });
  };

  api.collectionFind = function( collection, query ) {
    assert( collection, 'no collection' );
    return denodeify( function( resolver ) {
      collection.find( query ).toArray( resolver );
    });
  };

  api.collectionFindOne = function( collection, query ) {
    assert( collection, 'no collection' );
    assert( query,      'no query' );
    return denodeify( function( resolver ) {
      collection.findOne( query, resolver );
    });
  };

  api.collectionRemove = function( collection, query ) {
    assert( collection, 'no collection' );
    return denodeify( function( resolver ) {
      collection.remove( query, { w: 1 }, resolver );
    });
  };

  api.collectionRemoveById = function( collection, documentId ) {
    assert( collection, 'no collection' );
    return denodeify( function( resolver ) {
      collection.remove({"_id": new ObjectId( documentId )}, { w: 1 },  resolver );
    });
  };
  
  api.collectionDrop = function( collection ) {
    assert( collection, 'no collection' );
    return denodeify( function( resolver ) {
      collection.drop( resolver );
    });
  };
  
  api.drop = function( collections ) {
    assert( collections, 'no collections' );
    var self         = this;
    var dropPromises = [];
    for (var i=0;i<collections.length;i++) {
      dropPromises.push( self.collectionDrop( collections[i] ) );
    }
    return Q.allSettled( dropPromises );
  };
  
  api.close = function() {
    var self         = this;
    return denodeify( function( resolver ) {
      self.db.close( resolver );
    });
  }

  return api;
};

