
var mongoq           = require('./mongoq');
var fullcrumConfig   = require('./fullcrum.config');
var fullcrumMaster   = require('./fullcrum.master.config');
var fullcrumDb       = mongoq.Db( fullcrumConfig.mongoDbUrl );
var fullcrumAddAdmin = require('./fullcrum.add-admin');

exports.config   = fullcrumConfig;
exports.master   = fullcrumMaster;
exports.db       = fullcrumDb;
exports.addAdmin = fullcrumAddAdmin.main( fullcrumDb );
