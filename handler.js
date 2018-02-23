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
  console.log('Adding fixture file to test bucket');

  awsAccount.get_operational_bucket_name((bucketErr, bucketName) => {
    if (bucketErr) console.log(bucketErr, bucketErr.stack);
    else console.log(`Working with bucket ${bucketName}`);

    const region = process.env.AWS_REGION;
    AWS.config.update({ region });

    const s3 = new AWS.S3();

    const key = 'tests/testfile_in';

    const params = { Bucket: bucketName, Key: key, Body: 'testing' };
    s3.upload(params, (err, data) => {
      if (err) console.log(err, err.stack);
      else console.log(data);
    });
  });
};

module.exports.integration_test = (event, context, callback) => {
  const startRuntime = new Date();
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

  awsAccount.get_operational_bucket_name((bucketErr, bucketName) => {
    invokeQueue.push({ src: `s3://${bucketName}/tests/testfile_in`, dst: `s3://${bucketName}/tests/testfile_out` }, thisCallback);
    invokeQueue.push({ src: `s3://${bucketName}/non-existant-in`, dst: `s3://${bucketName}/non-existant-out` }, thisCallback);
    invokeQueue.push({ src: 'foo', dst: 'bar' }, thisCallback);

    invokeQueue.drain = () => {
      const runtime = {
        start: startRuntime.toISOString(),
        input_file_name: 'integration-test',
      };

      const report = {
        summary: summary(results, runtime),
        results,
      };

      const expectedReport = (report.summary.total === 2) || (report.summary.successes === 1);
      if (expectedReport) {
        return callback(null, report);
      }

      return callback(new CopyError('The report did not match the expected', report), report);
    };
  });
};
