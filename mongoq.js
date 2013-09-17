
var mongodb        = require('mongodb');
var MongoClient    = mongodb.MongoClient;
var Q              = require('q');
var ObjectId       = require('mongodb').ObjectID;

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
  }

  api.collectionSave = function( collection, document ) {
    return denodeify( function( resolver ) {
      collection.save( document, {w: 1}, resolver );
    });
  };

  api.collectionUpdate = function( collection, document ) {
    return denodeify( function( resolver ) {
      collection.update( document, {w: 1}, resolver );
    });
  };

  api.collectionInsert = function( collection, document ) {
    return denodeify( function( resolver ) {
      collection.insert( document, {w: 1}, resolver );
    });
  };

  api.collection = function( collectionName ) {
    var self         = this;
    return denodeify( function( resolver ) {
      self.db.collection( collectionName, resolver );
    });
  };

  api.collections = function( collectionNames ) {
    var self         = this;
    var openPromises = [];
    collectionNames.forEach( function( name ) {
      openPromises.push( self.collection(name) );  
    });
    return Q.all( openPromises );
  };
  
  api.collectionFindOneById = function( collection, documentId ) {
    return denodeify( function( resolver ) {
      collection.findOne({"_id": new ObjectId( documentId )}, resolver );
    });
  }

  api.collectionFind = function( collection, query ) {
    return denodeify( function( resolver ) {
      collection.find( query ).toArray( resolver );
    });
  }

  api.collectionRemove = function( collection, query ) {
    return denodeify( function( resolver ) {
      collection.remove( query, { w: 1 }, resolver );
    });
  };
  
  api.collectionDrop = function( collection ) {
    return denodeify( function( resolver ) {
      collection.drop( resolver );
    });
  };
  
  api.drop = function( collections ) {
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

