const AWS = require('aws-sdk');
const UrlParse = require('url-parse');


module.exports.one = (src, dst, callback) => {
    //  Copy the data at one S3 URI to another URI
    const s3 = new AWS.S3();
    const params = module.exports.get_cp_params(src, dst)

    s3.copyObject(params, function(err, data) {
        if (err) {
            return callback(err, data);
        }
        data.src = src;
        data.dst = dst;
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