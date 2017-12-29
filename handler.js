'use strict';

const AWS = require('aws-sdk');
const copy = require('./lib/copy');
const verification = require('./lib/verification');
const invoke = require('./lib/invoke');


module.exports.cp = (event, context, callback) => {
  const [src, dst] = verification(event)

  const this_callback = (err, data) => {
    return callback(err, data);
  }
  if (src && dst) copy(event.src, event.dst, this_callback)
    else this_callback(new Error("The source and/or destination were not valid"), event)
}

module.exports.manager = (event, context, callback) => {
  console.log(event);
  invoke('foo', 'bar', function(err, data) {
    if (err) console.error(err);
    return callback(err, data);
  })
}
