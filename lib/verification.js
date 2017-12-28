var UrlParse = require('url-parse');

module.exports.is_s3_path = (pathname) => {
    const path_parsed = new UrlParse(pathname);
    const is_uri = path_parsed.slashes
    const is_s3_uri = path_parsed.protocol == 's3:'

    return is_uri && is_s3_uri
}
