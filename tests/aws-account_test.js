const { expect } = require('chai');

const awsAccount = require('../lib/aws-account');

describe('GetBucket', () => {
  it('should get the operational bucket name', (done) => {
    const callback = (err, data) => {
      expect(err).to.equal(null);
      expect(data).to.equal('aws-s3cp-bulk-eu-west-1-006483271430-development');
      console.log(data);
      done();
    };
    awsAccount.get_operational_bucket_name(callback);
  });
});
