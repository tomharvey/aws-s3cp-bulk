var chai = require('chai');
var expect = chai.expect;
var UrlParse = require('url-parse');

var aws = require('../lib/aws');

describe('AWS', () => {
    it('should form the paramaters for the copy operation', () => {
        const src = "s3://bucket1/key/name.ext";
        const dst = "s3://bucket2/key/long/name.ext";

        expect(aws.get_cp_params(src, dst)).to.deep.equal({
            CopySource: '/bucket1/key/name.ext',
            Bucket: 'bucket2',
            Key: 'key/long/name.ext'
        })
    });
})
