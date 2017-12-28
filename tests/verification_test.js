var chai = require('chai');
var expect = chai.expect;
var UrlParse = require('url-parse');

var verification = require('../lib/verification');

describe('Verification', () => {
    it('should detect if the path is an s3 URI', () => {
        const s3_uri = "s3://bucket/key/name.ext";
        const http_uri = "http://example.com/key/name.ext";
        const file_uri = "file/path.ext";

        expect(verification.is_s3_path(s3_uri)).to.equal(true)
        expect(verification.is_s3_path(http_uri)).to.equal(false)
        expect(verification.is_s3_path(file_uri)).to.equal(false)
    });
})
