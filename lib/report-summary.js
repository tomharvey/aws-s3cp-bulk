const AWS = require('aws-sdk');

const reportKeyName = report => `reports/${report.summary.inputFileName}_result_${report.summary.startRuntime}.json`;

module.exports = (results, runtime) => {
  const total = results.length;
  let failures = 0;
  let successes = 0;

  results.forEach((result) => {
    if ((result[2]) === 'error') failures += 1;
    else successes += 1;
  });

  const { inputFileName } = runtime;
  const startRuntime = runtime.start;

  const report = {
    total,
    failures,
    successes,
    inputFileName,
    startRuntime,
  };

  return report;
};

module.exports.get_result_from_error = (error) => {
  const errorBody = JSON.parse(error);
  const result = [errorBody.extra.src, errorBody.extra.dst, 'error', errorBody.message];
  return result;
};

module.exports.get_result_from_success = (success) => {
  const result = [success.src, success.dst, 'success', success.CopyObjectResult.ETag];
  return result;
};

module.exports.write_report_to_s3 = (report, operationalBucket, callback) => {
  const region = process.env.AWS_REGION;
  AWS.config.update({ region });
  const s3 = new AWS.S3();

  const reportBody = JSON.stringify(report);
  const keyName = reportKeyName(report);

  const params = {
    Body: reportBody,
    Bucket: operationalBucket,
    Key: keyName,
  };
  s3.putObject(params, (err, data) => {
    if (err) console.log(err, err.stack);
    else console.log(data);
    callback(err, data);
  });
};
