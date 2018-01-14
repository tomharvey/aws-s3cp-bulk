'use strict';

const AWS = require('aws-sdk');
const async = require('async');

const copy = require('./lib/copy');
const verification = require('./lib/verification');
const invoke = require('./lib/invoke');


module.exports.cp = (event, context, callback) => {
  console.log(event)

  const [src, dst] = verification(event)

  const this_callback = (err, data) => {
    console.log("callback returning...")
    data['parentEvent'] = event;
    return callback(err, data);
  }

  if (src && dst) copy.one(event.src, event.dst, this_callback)
    else this_callback(new Error("The source and/or destination were not valid"), event)
}

module.exports.manager = (event, context, callback) => {
  console.log(event);

  const this_callback = (err, data) => {
    console.log("Returned" + data.Payload)
    console.log(data.Payload)
    console.log(err, data)

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
}
