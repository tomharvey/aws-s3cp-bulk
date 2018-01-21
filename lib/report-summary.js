module.exports = (results) => {
    const total = results.length;
    let failures = 0;
    let successes = 0;

    for(const result of results) {
        if( (result[2]) == "error") failures ++;
            else successes ++;
    }

    return { total, failures, successes }
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

module.exports.write_report_to_s3 = (report) => {
    // TODO - write the report into 
    // s3://OPERATIONAL_BUCKET/results/${input_file_name)_result_iso8601.json
}