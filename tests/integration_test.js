const async = require('async');
const invoke = require('../lib/invoke');
const summary = require('../lib/report-summary');

module.exports = (event, context, callback) => {
  const results = [];

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
  console.log(`Testing against ${testbucket}`);

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
