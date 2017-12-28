var UrlParse = require('url-parse');

module.exports.cp = (src, dst, callback) => {
    const s3 = new AWS.S3();
    const params = get_cp_params(src, dst)

    s3.copyObject(params, callback)
}

module.exports.get_cp_params = (src, dst) => {
    const src_parsed = new UrlParse(src);
    const dst_parsed = new UrlParse(dst);

    const params = {
        CopySource: "/" + src_parsed.hostname + src_parsed.pathname,
        Bucket: dst_parsed.hostname,
        Key: dst_parsed.pathname.replace(/^\/+/g, '')
    };

    return params
}