const AWS = require('aws-sdk');
const UrlParse = require('url-parse');

const CopyError = require('./copy-error');

const getCpParams = (src, dst) => {
  // Generate the params object expected by the s3.copyObject function
  const srcParsed = new UrlParse(src);
  const dstParsed = new UrlParse(dst);

  const params = {
    CopySource: `/${srcParsed.hostname}${srcParsed.pathname}`,
    Bucket: dstParsed.hostname,
    Key: dstParsed.pathname.replace(/^\/+/g, ''),
  };

  return params;
};


module.exports.one = (src, dst, callback) => {
  //  Copy the data at one S3 URI to another URI
  const region = process.env.AWS_REGION;
  AWS.config.update({ region });

  const s3 = new AWS.S3();
  const params = getCpParams(src, dst);

  s3.copyObject(params, (err, data) => {
    if (err) {
      return callback(new CopyError(err.message, { src, dst }));
    }

    const resultData = Object.assign({ src: data.src, dst: data.dst }, data);
    return callback(null, resultData);
  });
};

module.exports.get_cp_params = getCpParams;
