'use strict';

const AWS = require('aws-sdk');
const async = require('async');

const copy = require('./lib/copy');
const verification = require('./lib/verification');
const invoke = require('./lib/invoke');


function MyError(message, src, dst){
    this.message = message;
    this.src = src;
    this.dst = dst;
}

MyError.prototype = new Error();

module.exports.cp = (event, context, callback) => {
  const [src, dst] = verification(event)

  const this_callback = (err, data) => {
    return callback(JSON.stringify(err), data);
  }

  if (src && dst) copy.one(event.src, event.dst, this_callback)
    else {
      this_callback(new MyError("The source and/or destination were not valid", "foo", "baz"))
    }
}

module.exports.manager = (event, context, callback) => {
  var results = [];

  const this_callback = (err, data) => {
    var payload = JSON.parse(data.Payload);

    // if(payload['errorMessage']) {
    //   var error = JSON.parse(payload['errorMessage']);
    //   var result = [error['src'], error['dst'], "error", error['message'] ];
    // }
    // else {
    //   var result = [payload['src'], payload['dst'], "success", payload['CopyObjectResult']['ETag']];
    // }

    results.push(payload);

    return callback(err, data);
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
    console.log("CompletedResults:");
    console.log(results);
  };
}
