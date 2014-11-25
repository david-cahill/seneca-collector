"use strict";

module.exports = function( options ) {
  var seneca = this
  var plugin = 'collector'

  seneca.add({role: plugin, ping: true}, ping);

  function ping(args, done) {
    done(null, {now:Date.now()});
  };

  return {
    name: plugin
  }
}
