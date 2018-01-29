var chai = require('chai');
var expect = chai.expect;

var invoke = require('../lib/invoke');

describe ('Invoke', () => {
    it('should generate params to invoke a copy function', () => {
        const src = 'foo'
        const dst = 'bar'

        expect(invoke.get_invoke_params(src, dst)).to.deep.equal({
            FunctionName: 'aws-s3cp-bulk-development-copy',
            Payload: JSON.stringify({
                src: 'foo',
                dst: 'bar'
            })
        })
    })
})