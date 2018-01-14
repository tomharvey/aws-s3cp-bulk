'use strict';

const AWS = require('aws-sdk');
const async = require('async');

const copy = require('./lib/copy');
const verification = require('./lib/verification');
const invoke = require('./lib/invoke');
const CopyError = require('./lib/copy-error');


function MyError(message, src, dst){
    this.message = message;
    this.src = src;
    this.dst = dst;
}

MyError.prototype = new Error();

module.exports.cp = (event, context, callback) => {
  const [src_is_valid, dst_is_valid] = verification(event)

  const this_callback = (err, data) => {
    if(err) return callback(JSON.stringify(err), data);
      else return callback(null, data)
  }

  if (src_is_valid && dst_is_valid) copy.one(event.src, event.dst, this_callback)
    else {
      this_callback(new CopyError("The source and/or destination were not valid", {"src": event.src, "dst": event.dst}))
    }
}

module.exports.integration_test = (event, context, callback) => {
  let results = [];

  const this_callback = (err, data) => {
    const payload = JSON.parse(data.Payload);

    let result = [];
    if(payload['errorMessage']) {
      const error = JSON.parse(payload['errorMessage']);
      result = [ error.extra.src, error.extra.dst, "error", error.message ];
    }
    else {
      result = [ payload.src, payload.dst, "success", payload['CopyObjectResult']['ETag'] ];
    }

    results.push(result);
  }

  const concurrency = 500;
  const queueWorker = (taskdata, callback) => {
    invoke(taskdata.src, taskdata.dst, callback);
  };
  const invokeQueue = async.queue(queueWorker, concurrency)

  const testbucket = "aws-s3cp-bulk-006483271430-testfixturesbucket"

  invokeQueue.push({src: "s3://" + testbucket + "/testfile_in", dst: "s3://" + testbucket + "/testfile_out2"}, this_callback)
  invokeQueue.push({src: "s3://" + testbucket + "/testfile_out", dst: "s3://" + testbucket + "/testfile_out3"}, this_callback)
  invokeQueue.push({src: "s3://" + testbucket + "/non-existant-in", dst: "s3://" + testbucket + "/non-existant-out"}, this_callback)
  invokeQueue.push({src: "foo", dst: "bar"}, this_callback)

  invokeQueue.drain = function() {
    return callback(null, results);
  };
}
