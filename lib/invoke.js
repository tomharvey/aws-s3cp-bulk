const AWS = require('aws-sdk');


module.exports = (src, dst, callback) => {
    var lambda = new AWS.Lambda();
    lambda.invoke(get_invoke_params(src, dst), callback)
}

const get_invoke_params = (src, dst) => {
    return {
        FunctionName: 'aws-s3cp-bulk-production-copy',
        Payload: JSON.stringify({ src, dst })
    };
}

module.exports.get_invoke_params = get_invoke_params;
