var chai = require('chai');
var expect = chai.expect;
var UrlParse = require('url-parse');

describe('Verification', () => {
    it('should detect if the path is an s3 URI', () => {
        const s3_uri = "s3://bucket/key/name.ext";
        const file_uri = "file/path.ext";

        const s3_uri_parsed = new UrlParse(s3_uri);
        const file_uri_parsed = new UrlParse(file_uri);

        expect(s3_uri_parsed.slashes).to.equal(true);
        expect(file_uri_parsed.slashes).to.equal(false);

        expect(s3_uri_parsed.hostname).to.equal('bucket');
        expect(s3_uri_parsed.protocol).to.equal('s3:');
    });
})
