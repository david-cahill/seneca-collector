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
      } else if(args.type === 'time' && args.time === 'all') {
        query = "SELECT count(pattern) FROM " + options.seriesName + " WHERE pattern ='"+args.pattern+"' group by time(1m) order asc";
      } else {
        query = "SELECT count(pattern) FROM " + options.seriesName + " WHERE time > now() - " + args.time + " and pattern ='"+args.pattern+"' group by time(1m) order asc";
      }

    }

    client.query(query, function(err,response) {
      done(null,response);
    });
  });

  seneca.add({role:plugin, cmd:'getSenecaActions'}, function(args,done) {
    var query = 'select distinct(pattern) from ' + options.seriesName;
    client.query(query, function(err,response) {
      var patterns = response[0].points.map(function(action) {
        var pattern = {};
        action[1].split(',').forEach(function(pair) {
          var newPair = pair.split(':');
          pattern[newPair[0]] = newPair[1];
        });
        return pattern;
      });  
      done(null,patterns);
    });
  });

  return {
    name: plugin
  }
}
