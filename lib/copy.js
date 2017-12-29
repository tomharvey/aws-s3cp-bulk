const UrlParse = require('url-parse');


module.exports = (src, dst, callback) => {
    //  Copy the data at one S3 URI to another URI
    const s3 = new AWS.S3();
    const params = get_cp_params(src, dst)

    s3.copyObject(params, function(err, data) {
        if (err) {
            console.log(err, err.stack);
            return callback(err);
        }
        console.log(data)
        return callback(null, data);
    })
}

module.exports.get_cp_params = (src, dst) => {
    // Generate the params object expected by the s3.copyObject function
    const src_parsed = new UrlParse(src);
    const dst_parsed = new UrlParse(dst);

    const params = {
        CopySource: "/" + src_parsed.hostname + src_parsed.pathname,
        Bucket: dst_parsed.hostname,
        Key: dst_parsed.pathname.replace(/^\/+/g, '')
    };

    return params
}