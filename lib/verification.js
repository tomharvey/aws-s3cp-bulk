var UrlParse = require('url-parse');


module.exports = (event) => {
    // Returns the source and destination paths, if valid
    const src = module.exports.is_s3_path(event.src) ? event.src : false
    if (!src) console.warn( new Error("The source is invalid: " + event.src) )
    const dst = module.exports.is_s3_path(event.dst) ? event.dst : false
    if (!dst) console.warn( new Error("The destination is invalid: " + event.dst) )

    // Check that the destination is different from the source
    if ((src) && (dst) && (src == dst)) {
        console.warn( new Error("The source and destination are equal:" + src + " == " + dst) )
        return [false, false]
    }
    
    return [src, dst]
}

module.exports.is_s3_path = (pathname) => {
    // Validates that the path is an S3 URI
    const path_parsed = new UrlParse(pathname);

    const is_uri = path_parsed.slashes
    const is_s3_uri = path_parsed.protocol == 's3:'

    return is_uri && is_s3_uri
}
