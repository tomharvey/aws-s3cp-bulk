'use strict';

const AWS = require('aws-sdk');
const async = require('async');

const aws_account = require('./lib/aws-account');
const copy = require('./lib/copy');
const csv = require('./lib/csv-processor');
const verification = require('./lib/verification');
const invoke = require('./lib/invoke');
const CopyError = require('./lib/copy-error');
const summary = require("./lib/report-summary")


module.exports.cp = (event, context, callback) => {
  const [src_is_valid, dst_is_valid] = verification(event)

  const this_callback = (err, data) => {
    if(err) return callback(JSON.stringify(err), data);
      else return callback(null, data)
  }

  if (src_is_valid && dst_is_valid) copy.one(event.src, event.dst, this_callback)
    else {
      this_callback(
        new CopyError("The source and/or destination were not valid",
          {"src": event.src, "dst": event.dst}))
    }
}

module.exports.bulk_cp = (event, context, callback) => {
  console.log(event);
  const start_runtime = new Date();
  const key = event;

  aws_account.get_operational_bucket_name(function(err, data) {
    console.log(data);
    const bucket = data;
    const csv_path = {bucket, key}

    const stream = csv.get_from_s3(csv_path);

    const concurrency = process.env.CONCURRENCY;
    const queueWorker = (taskdata, callback) => {
      invoke(taskdata.src, taskdata.dst, callback);
    };
    const invokeQueue = async.queue(queueWorker, concurrency);

    let results = [];

    const process_row = (err, data) => {
      if(err) console.log(err, err.stack);
      const payload = JSON.parse(data.Payload);

      let result = [];
      if(payload['errorMessage']) {
        result = summary.get_result_from_error(payload['errorMessage'])
      }
      else {
        result = summary.get_result_from_success(payload);
      }
      results.push(result);
    }

    csv.parse_csv_from_stream(stream, invokeQueue, process_row);

    const runtime = {
      'start': start_runtime.toISOString(),
      'input_file_name': 'integration_objects.csv'
    }

    invokeQueue.drain = () => {
      const report = {
        "summary": summary(results, runtime),
        results,
      }
      console.log(report.summary);

      summary.write_report_to_s3(report, bucket, function(err, data) {
        if(err) console.log(err, err.stack);
        console.log(data)
        callback()
      })
    };
  })
}

module.exports.integration_test = (event, context, callback) => {
  // TODO: Move this function into the tests folder
  let results = [];

  const this_callback = (err, data) => {
    const payload = JSON.parse(data.Payload);

    let result = [];
    if(payload['errorMessage']) {
      result = summary.get_result_from_error(payload['errorMessage'])
    }
    else {
      result = summary.get_result_from_success(payload);
    }

    results.push(result);
  }

  const concurrency = process.env.CONCURRENCY;

  const queueWorker = (taskdata, callback) => {
    invoke(taskdata.src, taskdata.dst, callback);
  };
  const invokeQueue = async.queue(queueWorker, concurrency)

  const testbucket = "aws-s3cp-bulk-006483271430-testfixturesbucket"

  invokeQueue.push({src: "s3://" + testbucket + "/testfile_in", dst: "s3://" + testbucket + "/testfile_out2"}, this_callback)
  invokeQueue.push({src: "s3://" + testbucket + "/testfile_out", dst: "s3://" + testbucket + "/testfile_out3"}, this_callback)
  invokeQueue.push({src: "s3://" + testbucket + "/non-existant-in", dst: "s3://" + testbucket + "/non-existant-out"}, this_callback)
  invokeQueue.push({src: "foo", dst: "bar"}, this_callback)

  invokeQueue.drain = function() {
    const report = {
      "summary": summary(results),
      results,
    }
    return callback(null, report);
  };
}
