'use strict';

module.exports.cp = (event, context, callback) => {
  console.log(event)
  console.log(context)

  callback(null, false)
}

module.exports.bulk_cp = (event, context, callback) => {
  console.log(event);
  console.log(context);

  var params = {
    FunctionName: 'copy',
    InvocationType: Event,
    Payload: 'tom'
  };

  var lambda = new AWS.Lambda();
  lambda.invoke(params, callback);
}