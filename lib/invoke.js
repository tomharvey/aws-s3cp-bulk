const AWS = require('aws-sdk');

const getInvokeParams = (src, dst) => {
  const stage = process.env.STAGE || 'development';
  return {
    FunctionName: `aws-s3cp-bulk-${stage}-copy`,
    Payload: JSON.stringify({ src, dst }),
  };
};

module.exports = (src, dst, callback) => {
  const region = process.env.AWS_REGION;
  AWS.config.update({ region });
  const lambda = new AWS.Lambda();
  lambda.invoke(getInvokeParams(src, dst), callback);
};

module.exports.get_invoke_params = getInvokeParams;
