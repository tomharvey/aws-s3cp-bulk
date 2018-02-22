const UrlParse = require('url-parse');

const isS3Path = (pathname) => {
  // Validates that the path is an S3 URI
  const pathParsed = new UrlParse(pathname);

  const isUri = pathParsed.slashes;
  const isS3Uri = pathParsed.protocol === 's3:';

  return isUri && isS3Uri;
};

module.exports = (event) => {
  // Returns the source and destination paths, if valid
  const src = isS3Path(event.src) ? event.src : false;
  if (!src) console.warn(new Error(`The source is invalid: ${event.src}`));
  const dst = isS3Path(event.dst) ? event.dst : false;
  if (!dst) console.warn(new Error(`The destination is invalid: ${event.dst}`));

  // Check that the destination is different from the source
  if ((src) && (dst) && (src === dst)) {
    console.warn(new Error(`The source and destination are equal: ${src} === ${dst}`));
    return [false, false];
  }

  return [src, dst];
};

module.exports.is_s3_path = isS3Path;
