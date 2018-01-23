var chai = require('chai');
var expect = chai.expect;
var assert = chai.assert

var csv = require('../lib/csv-processor');

const async = require('async');
const summary = require("../lib/report-summary")
const invoke = require('../lib/invoke');

describe('CSV', () => {
    it('should get the csv file', (done) => {
        const csv_path = {
            'bucket': 'aws-s3cp-bulk-006483271430-testfixturesbucket',
            'key': 'integration_objects.csv'
        }

        const stream = csv.get_from_s3(csv_path)

        // Get and process
        const concurrency = process.env.CONCURRENCY;
        const queueWorker = (taskdata, callback) => {
            invoke(taskdata.src, taskdata.dst, callback);
        };
        const invokeQueue = async.queue(queueWorker, concurrency)
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

        invokeQueue.drain = function() {
            const report = {
                "summary": summary(results),
                results,
            }
            console.log(report.summary);
            console.log(report.results);

            expect(report.summary.total).to.equal(4);
            expect(report.summary.failures).to.equal(2);
            expect(report.summary.successes).to.equal(2);
            done()
        };
    })
})

