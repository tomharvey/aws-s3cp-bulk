const AWS = require('aws-sdk');

const getAccountId = (callback) => {
  const region = process.env.AWS_REGION;
  AWS.config.update({ region });

  const sts = new AWS.STS();
  sts.getCallerIdentity({}, (err, data) => {
    if (err) {
      console.log(err, err.stack);
      callback(err);
    } else {
      callback(null, data);
    }
  });
};

module.exports.get_operational_bucket_name = (callback) => {
  const region = process.env.AWS_REGION;
  AWS.config.update({ region });

  getAccountId((err, data) => {
    const prefix = process.env.OPERATIONAL_BUCKET_PREFIX || 'aws-s3cp-bulk';
    const stage = process.env.STAGE || 'development';

    const bucketName = `${prefix}-${region}-${data.Account}-${stage}`;
    callback(err, bucketName);
  });
};
