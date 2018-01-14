'use strict';

const AWS = require('aws-sdk');
const async = require('async');

const copy = require('./lib/copy');
const verification = require('./lib/verification');
const invoke = require('./lib/invoke');


module.exports.cp = (event, context, callback) => {
  const [src, dst] = verification(event)

  const this_callback = (err, data) => {
    return callback(err, data);
  }

  if (src && dst) copy.one(event.src, event.dst, this_callback)
    else this_callback(new Error("The source and/or destination were not valid"), event)
}

module.exports.manager = (event, context, callback) => {
  var results = [];

  const this_callback = (err, data) => {
    console.log(err, data);

    console.log(typeof data.Payload)

    if(data.Payload['errorMessage']) {
      var result = [data.Payload['src'], data.Payload['dst'], "err", data.Payload];
    }
    else {
      var result = [data.Payload['src'], data.Payload['dst'], "success", data.Payload];
    }

    results.push(result);

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
  invokeQueue.push({src: "foo", dst: "bar"}, this_callback)

  invokeQueue.drain = function() {
    console.log("CompletedResults:");
    console.log(results);
  };
}
