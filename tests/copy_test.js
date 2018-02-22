const { expect, assert } = require('chai');

const copy = require('../lib/copy');

describe('Copy Integration', () => {
  it('should be able to copy a file', (done) => {
    const testbucket = 'aws-s3cp-bulk-006483271430-testfixturesbucket';
    const src = `s3://${testbucket}/testfile_in`;
    const dst = `s3://${testbucket}/testfile_out`;

    const callback = (err, data) => {
      expect(err).to.equal(null);
      assert.containsAllKeys((data), ['CopyObjectResult', 'src', 'dst']);

      done();
    };
    copy.one(src, dst, callback);
  });

  it('should report copy errors as successful run', (done) => {
    const testbucket = 'aws-s3cp-bulk-006483271430-testfixturesbucket';
    const src = `s3://${testbucket}/non-existant-file-input`;
    const dst = `s3://${testbucket}/non-existant-file-output`;

    const callback = (err) => {
      expect(err).to.exist.and.be.instanceof(Error);
      expect(err.message).to.equal('The specified key does not exist.');
      expect(err.extra.src).to.equal(src);

      done();
    };
    copy.one(src, dst, callback);
  });
});
