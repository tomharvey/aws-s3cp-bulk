const { expect } = require('chai');

const verification = require('../lib/verification');

describe('Verification', () => {
  it('should detect if the path is an s3 URI', () => {
    const s3Uri = 's3://bucket/key/name.ext';
    const httpUri = 'http://example.com/key/name.ext';
    const fileUri = 'file/path.ext';

    expect(verification.is_s3_path(s3Uri)).to.equal(true);
    expect(verification.is_s3_path(httpUri)).to.equal(false);
    expect(verification.is_s3_path(fileUri)).to.equal(false);
  });

  it('should return the src and destination if valid', () => {
    const validEvent = {
      src: 's3://bucket/key/old_name.ext',
      dst: 's3://bucket/key/new_name.ext',
    };
    const [src, dst] = verification(validEvent);
    expect(src).to.equal('s3://bucket/key/old_name.ext');
    expect(dst).to.equal('s3://bucket/key/new_name.ext');
  });

  it('should return false if the paths are not s3', () => {
    const nonS3Event = {
      src: 'file/path.ext',
      dst: 'http://example.com/key/name.ext',
    };
    const [src, dst] = verification(nonS3Event);
    expect(src).to.equal(false);
    expect(dst).to.equal(false);
  });

  it('should return false if the source and destination are the same', () => {
    const nonS3Event = {
      src: 's3://bucket/key/existing_name.ext',
      dst: 's3://bucket/key/existing_name.ext',
    };
    const [src, dst] = verification(nonS3Event);
    expect(src).to.equal(false);
    expect(dst).to.equal(false);
  });
});
