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

    it('should return the src and destination if valid', () => {
        const valid_event = {
            src: "s3://bucket/key/old_name.ext",
            dst: "s3://bucket/key/new_name.ext"
        }
        const [src, dst] = verification(valid_event)
        expect(src).to.equal("s3://bucket/key/old_name.ext")
        expect(dst).to.equal("s3://bucket/key/new_name.ext")
    })

    it("should return false if the paths are not s3", () => {
        const non_s3_event = {
            src: "file/path.ext",
            dst: "http://example.com/key/name.ext"
        }
        const [src, dst] = verification(non_s3_event)
        expect(src).to.equal(false)
        expect(dst).to.equal(false)
    })

    it("should return false if the source and destination are the same", () => {
        const non_s3_event = {
            src: "s3://bucket/key/existing_name.ext",
            dst: "s3://bucket/key/existing_name.ext"
        }
        const [src, dst] = verification(non_s3_event)
        expect(src).to.equal(false)
        expect(dst).to.equal(false)
    })
})
