const AWS = require('aws-sdk');
const parse = require('fast-csv')

const get_from_s3 = (csv_path, callback) => {
    const s3 = new AWS.S3();
    const params = {
        Bucket: csv_path.bucket, 
        Key: csv_path.key
    }

    const s3Stream = s3.getObject(params).createReadStream()
    return s3Stream;
}

const parse_csv_from_stream = (stream, invokeQueue, worker_callback) => {
    parse.fromStream(stream)
        .on('data', (data) => {
            invokeQueue.push({'src': data[0], 'dst': data[1]}, worker_callback)
        });
}

module.exports.get_from_s3 = get_from_s3;
module.exports.parse_csv_from_stream = parse_csv_from_stream;
