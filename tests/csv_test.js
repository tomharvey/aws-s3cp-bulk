const { expect, assert } = require('chai');

const csv = require('../lib/csv-processor');

const async = require('async');
const summary = require('../lib/report-summary');
const invoke = require('../lib/invoke');

describe('CSV', () => {
  it('should get the csv file', (done) => {
    const key = 'integration_objects.csv';
    const bucket = 'aws-s3cp-bulk-006483271430-testfixturesbucket';
    const csvPath = { bucket, key };

    const startRuntime = new Date();
    const runtime = {
      start: startRuntime.toISOString(),
      input_file_name: 'integration_objects.csv',
    };

    const stream = csv.get_from_s3(csvPath);

    // Get and process
    const concurrency = process.env.CONCURRENCY;
    const queueWorker = (taskdata, callback) => {
      invoke(taskdata.src, taskdata.dst, callback);
    };
    const invokeQueue = async.queue(queueWorker, concurrency);
    const results = [];

    const processRow = (err, data) => {
      let result;

      if (err) {
        console.log(err, err.stack);
        result = { errorMessage: err };
      } else {
        const payload = JSON.parse(data.Payload);

        if (payload.errorMessage) {
          result = summary.get_result_from_error(payload.errorMessage);
        } else {
          result = summary.get_result_from_success(payload);
        }
      }

      results.push(result);
    };

    csv.parse_csv_from_stream(stream, invokeQueue, processRow);

    invokeQueue.drain = () => {
      const report = {
        summary: summary(results, runtime),
        results,
      };
      console.log(report.summary);
      console.log(report.results);

      expect(report.summary.total).to.equal(4);
      expect(report.summary.failures).to.equal(2);
      expect(report.summary.successes).to.equal(2);
      summary.write_report_to_s3(report, bucket, (err, data) => {
        assert.containsAllKeys((data), ['ETag']);
        done();
      });
    };
  });
});

