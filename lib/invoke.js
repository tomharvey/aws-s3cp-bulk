const AWS = require('aws-sdk');

module.exports.get_invoke_params = (src, dst) => {
    return {
        FunctionName: 'aws-s3cp-bulk-production-copy',
        Payload: JSON.stringify({ src, dst })
    };
}

module.exports = (src, dst, callback) => {
    var lambda = new AWS.Lambda();
    lambda.invoke(module.exports.get_invoke_params('foo', 'bar'), callback)
}