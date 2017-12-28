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
  console.log("Invoking")

  var params = {
    FunctionName: 'aws-s3cp-bulk-production-copy',
    InvocationType: 'Event',
    Payload: "tom"
    }
  };

  var lambda = new AWS.Lambda();
  lambda.invoke(params, function(err, data) {
    if (err) {
      console.log(err, err.stack);
      callback(err, data)
    }
    else{
      console.log(data);
      callback(err, data)
    }
  });
}