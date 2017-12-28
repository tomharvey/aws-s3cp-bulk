'use strict';

module.exports.cp = (event, context, callback) => {
  console.log(event)
  console.log(context)

  callback(null, false)
}

module.exports.bulk_cp = (event, context, callback) => {
  console.log(event);
  console.log(context);

  var lambda = new AWS.Lambda();
  var params = {
    FunctionName: 'copy',
    InvocationType: Event,
    Payload: {
      ['s3://src/file/1.jpg', 's3://dst/file/1.jpg'],
      ['s3://src/file/2.jpg', 's3://dst/file/2.jpg']
    }
  };
  lambda.invoke(params, callback)
}