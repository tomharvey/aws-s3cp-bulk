const { expect } = require('chai');

const summary = require('../lib/report-summary');
const CopyError = require('../lib/copy-error');

describe('ReportSummary', () => {
  it('should generate a summary of the results', () => {
    const results = [
      [
        'foo',
        'bar',
        'error',
        'The source and/or destination were not valid',
      ],
      [
        's3://aws-s3cp-bulk-AccountId-testfixturesbucket/testfile_out',
        's3://aws-s3cp-bulk-AccountId-testfixturesbucket/testfile_out3',
        'success',
        '5d41402abc4b2a76b9719d911017c592',
      ],
      [
        's3://aws-s3cp-bulk-AccountId-testfixturesbucket/non-existant-in',
        's3://aws-s3cp-bulk-AccountId-testfixturesbucket/non-existant-out',
        'error',
        'Access Denied',
      ],
      [
        's3://aws-s3cp-bulk-AccountId-testfixturesbucket/testfile_in',
        's3://aws-s3cp-bulk-AccountId-testfixturesbucket/testfile_out2',
        'success',
        '5d41402abc4b2a76b9719d911017c592',
      ],
    ];
    const runtime = {
      start: '2018-01-01T00:00:00',
      inputFileName: '/path/to/foo.csv',
    };

    expect(summary(results, runtime)).to.deep.equal({
      total: 4,
      failures: 2,
      successes: 2,
      startRuntime: '2018-01-01T00:00:00',
      inputFileName: '/path/to/foo.csv',
    });
  });

  it('should parse the success response from lambda into a single result', () => {
    const success = {
      src: 's3://a-real-file-input',
      dst: 's3://a-real-file-output',
      CopyObjectResult: {
        ETag: 'hash-string',
        LastModified: '2018-01-01',
      },
    };

    expect(summary.get_result_from_success(success)).to.deep.equal([
      's3://a-real-file-input',
      's3://a-real-file-output',
      'success',
      'hash-string',
    ]);
  });

  it('should parse the error response from lambda into a single result', () => {
    const error = new CopyError('message', { src: 'foo', dst: 'bar' });

    expect(summary.get_result_from_error(JSON.stringify(error))).to.deep.equal([
      'foo',
      'bar',
      'error',
      'message',
    ]);
  });
});
