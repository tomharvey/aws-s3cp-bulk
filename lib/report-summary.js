const AWS = require('aws-sdk');

module.exports = (results, runtime) => {
    const total = results.length;
    let failures = 0;
    let successes = 0;

    for(const result of results) {
        if( (result[2]) == "error") failures ++;
            else successes ++;
    }

    const input_file_name = runtime['input_file_name'];
    const start_runtime = runtime['start'];

    return { total, failures, successes, input_file_name, start_runtime }
}

module.exports.get_result_from_error = (error) => {
    const error_body = JSON.parse(error);
    result = [ error_body.extra.src, error_body.extra.dst, "error", error_body.message ];
    return result
}

module.exports.get_result_from_success = (success) => {
    result = [ success.src, success.dst, "success", success['CopyObjectResult']['ETag'] ];
    return result
}

module.exports.write_report_to_s3 = (report, operational_bucket, callback) => {
    const region = process.env.AWS_REGION
    AWS.config.update({region});
    const s3 = new AWS.S3();

    const report_body = JSON.stringify(report)
    const key_name = report_key_name(report)

    const params = {
        Body: report_body, 
        Bucket: operational_bucket,
        Key: key_name
    };
    s3.putObject(params, function(err, data) {
        if (err) console.log(err, err.stack);
        else console.log(data);
        callback(err, data);
    })
}

const report_key_name = (report) => {
    return `reports/${report.summary.input_file_name}_result_${report.summary.start_runtime}.json`
}