var chai = require('chai');
var expect = chai.expect;
var assert = chai.assert

var aws_account = require('../lib/aws-account');

describe('GetBucket', () => {

    it('should get the operational bucket name', (done) => {
        
        const callback = (err, data) => {
            expect(err).to.equal(null)
            console.log(data)
            done();
        }
        aws_account.get_operational_bucket_name(callback)
    });

})
