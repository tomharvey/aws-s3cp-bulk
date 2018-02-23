const AWS = require('aws-sdk');
const async = require('async');
const awsAccount = require('./lib/aws-account');
const copy = require('./lib/copy');
const csv = require('./lib/csv-processor');
const verification = require('./lib/verification');
const invoke = require('./lib/invoke');
const CopyError = require('./lib/copy-error');
const summary = require('./lib/report-summary');


module.exports.cp = (event, context, callback) => {
  const [srcIsValid, dstIsValid] = verification(event);

  const thisCallback = (err, data) => {
    if (err) return callback(JSON.stringify(err), data);
    return callback(null, data);
  };

  if (srcIsValid && dstIsValid) copy.one(event.src, event.dst, thisCallback);
  else {
    thisCallback(new CopyError('The source and/or destination were not valid', { src: event.src, dst: event.dst }));
  }
};

module.exports.bulk_cp = (event, context, callback) => {
  console.log(event);
  const startRuntime = new Date();
  const key = event;

  awsAccount.get_operational_bucket_name((err, data) => {
    console.log(data);
    const bucket = data;
    const csvPath = { bucket, key };

    const stream = csv.getFromS3(csvPath);

    const concurrency = process.env.CONCURRENCY;
    const queueWorker = (taskdata, workerCallback) => {
      invoke(taskdata.src, taskdata.dst, workerCallback);
    };
    const invokeQueue = async.queue(queueWorker, concurrency);

    const results = [];

    const processRow = (error, rowData) => {
      if (error) console.log(error, error.stack);
      const payload = JSON.parse(rowData.Payload);

      let result = [];
      if (payload.errorMessage) {
        result = summary.get_result_from_error(payload.errorMessage);
      } else {
        result = summary.get_result_from_success(payload);
      }
      results.push(result);
    };

    csv.parseCsvFromStream(stream, invokeQueue, processRow);

    const runtime = {
      start: startRuntime.toISOString(),
      input_file_name: 'integration_objects.csv',
    };

    invokeQueue.drain = () => {
      const report = {
        summary: summary(results, runtime),
        results,
      };
      console.log(report.summary);

      summary.write_report_to_s3(report, bucket, (error, reportData) => {
        if (error) console.log(error, error.stack);
        console.log(reportData);
        callback();
      });
    };
  });
};

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
