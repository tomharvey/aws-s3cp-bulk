'use strict';

const AWS = require('aws-sdk');
const async = require('async');

const copy = require('./lib/copy');
const verification = require('./lib/verification');
const invoke = require('./lib/invoke');


module.exports.cp = (event, context, callback) => {
  console.log(context)
  console.log(callback)

  const [src, dst] = verification(event)

  const this_callback = (err, data) => {
    console.log("callback returning...")
    return callback(err, data);
  }

  if (src && dst) copy(event.src, event.dst, this_callback)
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

  const concurrency = 2;
  const queueWorker = (taskdata, callback) => {
    invoke(taskdata.src, taskdata.dst, callback);
  };
  const invokeQueue = async.queue(queueWorker, concurrency)

  invokeQueue.push({src: 'foo', dst: 'bar'}, this_callback)
  invokeQueue.push({src: 'baz', dst: 'bat'}, this_callback)
}
