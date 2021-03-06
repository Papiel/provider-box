'use strict';

var box = require('./box');


/**
 * Build a uuid for each DB file.
 *
 * @param {int} uid User ID (available on the tokens)
 * @param {path} path File path
 */
var _identifier = function(id) {
  return 'https://box.com/' + id;
};

var uploadFile = function(identifier, metadatas, accessToken, anyfetchClient, cb) {
  console.log("UPPING", identifier);
  var filename = metadatas.path.substr(metadatas.path.lastIndexOf('/') + 1);
  var title = filename;
  if(title.lastIndexOf('.') !== -1) {
    title = title.substr(0, filename.lastIndexOf('.'));
  }
  title = title.replace(/(_|-)/g, ' ');
  
  var document = {
    identifier: identifier,
    actions: {
      'show': 'https://app.box.com/' + metadatas.id
    },
    metadatas: {
      title: title,
      path: metadatas.path
    },
    binary_document_type: "file",
    user_access: [anyfetchClient.accessToken]
  };

  // Stream the file from DB servers
  box.downloadFile(metadatas.id, accessToken, function(err, reply) {
    if(err) {
      return cb(err);
    }

    // File to send
    var fileConfig = {
      file: reply,
      filename: filename,
      knownLength: reply.length
    };

    // Let's roll.
    anyfetchClient.sendDocumentAndFile(document, fileConfig, cb);
  });
};

var deleteFile = function(identifier, anyfetchClient, cb) {
  console.log("DELING", identifier);
  anyfetchClient.deleteDocument(identifier, cb);
};


/**
 * Run the task of uploading a document to AnyFetch.
 * This function will be used as a queue
 * @see https://github.com/caolan/async#queueworker-concurrency
 *
 * @param {Object} task Task param
 * @param {Function} cb Callback once task has been processed.
 */
module.exports = function(task, anyfetchClient, tokens, cb) {
  var accessToken = tokens.access_token;

  var throwCb = function(err) {
    if(err) {
      throw err;
    }
    cb();
  };

  var identifier = _identifier(task.id);
  if(task.deleted) {
    // File has been removed
    return deleteFile(identifier, anyfetchClient, throwCb);
  }
  else {
    // Upload file onto AnyFetch
    return uploadFile(identifier, task, accessToken, anyfetchClient, throwCb);
  }
};
