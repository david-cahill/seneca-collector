"use strict";

var _      = require('underscore');
var influx = require('influx');

module.exports = function( options ) {
  var seneca = this
  var plugin = 'collector'

  seneca.add({role: plugin, ping: true}, ping);

  function ping(args, done) {
    done(null, {now:Date.now()});
  };

  var client = influx({
    //cluster configuration
    hosts : [
      {
        host : options.host,
        port : options.port //optional. default 8086
      }
    ],
    // or single-host configuration
    host : options.host,
    port : options.port,// optional, default 8086
    username : options.username,
    password : options.password,
    database : options.database
  });

  seneca.add({role:plugin, cmd:'send'}, function(args,done){
    client.writePoint(options.seriesName, args.point, args.options, function(response) {
      done(null, {data:'received'});
    });

  });

  seneca.add({role:plugin, cmd: 'get'}, function(args, done) {
    var query = '';
    if(args.fieldName && options.seriesName) {
      query = 'SELECT ' + args.fieldName + ' FROM ' + options.seriesName;
    } else {

      if(args.type === 'normal') {
        query = "SELECT * FROM " + options.seriesName + " WHERE pattern ='"+args.pattern+"'";
      } else {
        query = "select count(pattern) from " + options.seriesName + " where time > now() - 2d and pattern='"+args.pattern+"' group by time(1m) order asc";
      }

    }

    client.query(query, function(err,response) {
      done(null,response);
    });
  });

  return {
    name: plugin
  }
}
