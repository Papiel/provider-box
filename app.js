"use strict";

// Load configuration and initialize server
var anyfetchProvider = require('anyfetch-provider');
var serverConfig = require('./lib/provider-box');


var server = anyfetchProvider.createServer(serverConfig);

// Expose the server
module.exports = server;
