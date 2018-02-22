const AWS = require('aws-sdk');
const parse = require('fast-csv');

const getFromS3 = (csvPath) => {
  const region = process.env.AWS_REGION;
  AWS.config.update({ region });

  const s3 = new AWS.S3();
  const params = {
    Bucket: csvPath.bucket,
    Key: csvPath.key,
  };

  const s3Stream = s3.getObject(params).createReadStream();
  return s3Stream;
};

const parseCsvFromStream = (stream, invokeQueue, workerCallback) => {
  parse.fromStream(stream)
    .on('data', (data) => {
      invokeQueue.push({ src: data[0], dst: data[1] }, workerCallback);
    });
};

module.exports.get_from_s3 = getFromS3;
module.exports.parse_csv_from_stream = parseCsvFromStream;
