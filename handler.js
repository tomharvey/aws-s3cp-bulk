'use strict';

const AWS = require('aws-sdk');


module.exports.cp = (event, context, callback) => {
  console.log(event)
  console.log(context)

  callback(null, false)
}

module.exports.bulk_cp = (event, context, callback) => {
  console.log(event);
  console.log(context);

  var params = {
    FunctionName: 'aws-s3cp-bulk-production-copy',
    InvocationType: 'Event',
    Payload: JSON.stringify({
      src: 'foo',
      dst: 'bar'
    })
  };

  var lambda = new AWS.Lambda();
  lambda.invoke(params, callback);
}