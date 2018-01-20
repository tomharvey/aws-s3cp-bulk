var chai = require('chai');
var expect = chai.expect;
var assert = chai.assert

var copy = require('../lib/copy');

describe('Copy', () => {
    it('should form the paramaters for the copy operation', () => {
        const src = "s3://bucket1/key/name.ext";
        const dst = "s3://bucket2/key/long/name.ext";

        expect(copy.get_cp_params(src, dst)).to.deep.equal({
            CopySource: '/bucket1/key/name.ext',
            Bucket: 'bucket2',
            Key: 'key/long/name.ext'
        })
    });

    it('should be able to copy a file', (done) => {
        const testbucket = "aws-s3cp-bulk-006483271430-testfixturesbucket"
        const src = "s3://" + testbucket + "/testfile_in"
        const dst = "s3://" + testbucket + "/testfile_out"

        const callback = (err, data) => {
            expect(err).to.equal(null)
            assert.containsAllKeys((data), ['CopyObjectResult', 'src', 'dst'])

            done();
        }
        copy.one(src, dst, callback)
    });

    it('should report copy errors as successful run', (done) => {
        const testbucket = "aws-s3cp-bulk-006483271430-testfixturesbucket"
        const src = "s3://" + testbucket + "/non-existant-file-input"
        const dst = "s3://" + testbucket + "/non-existant-file-output"

        const callback = (err, data) => {
            console.log(err);
            expect(err).to.exist.and.be.instanceof(Error)
            expect(err.message).to.equal("The specified key does not exist.")
            expect(err.extra.src).to.equal(src)

            done();
        }
        copy.one(src, dst, callback)
    })
})
