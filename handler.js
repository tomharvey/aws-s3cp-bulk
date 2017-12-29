'use strict';

const AWS = require('aws-sdk');
const copy = require('./lib/copy');
const verification = require('./lib/verification');


module.exports.cp = (event, context, callback) => {
  console.log("Starting")
  console.log(event)
  console.log(context)

  const [src, dst] = verification(event)
  if (src && dst) copy(event.src, event.dst, callback)
    else callback(new Error("The source and/or destination were not valid"), event)
}

module.exports.manager = (event, context, callback) => {
  console.log(event);
  console.log(context);
  console.log("Invoking")

  var params1 = {
    FunctionName: 'aws-s3cp-bulk-production-copy',
    Payload: JSON.stringify({
      src: 'foo',
      dst: 'bar'
    })
  };

  var params2 = {
    FunctionName: 'aws-s3cp-bulk-production-copy',
    Payload: JSON.stringify({
      src: 'baz',
      dst: 'bat'
    })
  };

  var lambda = new AWS.Lambda();
  
  lambda.invoke(params1, function(err, data) {
    console.log("Returned 1")
    if (err) {
      console.log(err, err.stack);
    }
    else{
      console.log(data);
    }
  });

  lambda.invoke(params2, function(err, data) {
    console.log("Returned 2")
    if (err) {
      console.log(err, err.stack);
    }
    else{
      console.log(data);
    }
  });
}
