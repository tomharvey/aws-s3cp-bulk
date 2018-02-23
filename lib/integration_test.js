const AWS = require('aws-sdk');
const async = require('async');
const invoke = require('../lib/invoke');
const summary = require('../lib/report-summary');

const addtestFixture = () => {
  const region = process.env.AWS_REGION;
  AWS.config.update({ region });

  const s3 = new AWS.S3();

  const testbucket = process.env.OPERATIONAL_BUCKET;
  const key = '/tests/testfile_in';
  const params = { Bucket: testbucket, Key: key, Body: 'testing' };
  s3.upload(params, (err, data) => {
    console.log(err, data);
  });
};

module.exports = (event, context, callback) => {
  const results = [];

  addtestFixture();

  const thisCallback = (err, data) => {
    const payload = JSON.parse(data.Payload);

    let result = [];
    if (payload.errorMessage) {
      result = summary.get_result_from_error(payload.errorMessage);
    } else {
      result = summary.get_result_from_success(payload);
    }

    results.push(result);
  };

  const concurrency = process.env.CONCURRENCY;

  const queueWorker = (taskdata, workerCallback) => {
    invoke(taskdata.src, taskdata.dst, workerCallback);
  };
  const invokeQueue = async.queue(queueWorker, concurrency);

  const testbucket = process.env.OPERATIONAL_BUCKET;

  invokeQueue.push({ src: `s3://${testbucket}/tests/testfile_in`, dst: `s3://${testbucket}/tests/testfile_out` }, thisCallback);
  invokeQueue.push({ src: `s3://${testbucket}/non-existant-in`, dst: `s3://${testbucket}/non-existant-out` }, thisCallback);
  invokeQueue.push({ src: 'foo', dst: 'bar' }, thisCallback);

  invokeQueue.drain = () => {
    const report = {
      summary: summary(results),
      results,
    };
    return callback(null, report);
  };
};
