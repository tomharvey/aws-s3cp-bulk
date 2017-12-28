'use strict';

module.exports.cp = (event, context, callback) => {
  console.log(event)
  console.log(context)

  callback(null, false)
}