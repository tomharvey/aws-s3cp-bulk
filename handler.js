'use strict';

const AWS = require('aws-sdk');
const copy = require('./lib/copy');
const verification = require('./lib/verification');
const invoke = require('./lib/invoke');


module.exports.cp = (event, context, callback) => {
  const [src, dst] = verification(event)
  if (src && dst) copy(event.src, event.dst, callback)
    else callback(new Error("The source and/or destination were not valid"), event)
}

module.exports.manager = (event, context, callback) => {
  console.log(event);
  invoke('foo', 'bar', callback)
}
