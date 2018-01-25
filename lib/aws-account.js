const AWS = require('aws-sdk');

const get_account_id = (callback) => {
        const region = process.env.AWS_REGION
        AWS.config.update({region});

        var sts = new AWS.STS();
        sts.getCallerIdentity({}, function(err, data) {
             if (err) {
                    console.log(err, err.stack);
                    callback(err);
             } else {
                    callback(null, data);
             }
        });
}

module.exports.get_operational_bucket_name = (callback) => {
    const region = process.env.AWS_REGION;
    AWS.config.update({region});

    get_account_id(function(err, data) {
        const prefix = process.env.OPERATIONAL_BUCKET_PREFIX;
        const stage = process.env.STAGE;

        const bucket_name = `${prefix}-${region}-${data.Account}-${stage}`
        callback(err, bucket_name);
    })
}