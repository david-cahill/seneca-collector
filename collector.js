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
    client.writePoint('actions', args.point, args.options, function(response) {
      done(null, {data:'received'});
    });

  });

  seneca.add({role:plugin, cmd: 'get'}, function(args, done) {
    var query = '';
    if(args.fieldName && args.seriesName) {
      query = 'SELECT ' + args.fieldName + ' FROM ' + args.seriesName;
    } else {
      query = "SELECT * FROM " + args.seriesName + " WHERE pattern ='"+args.pattern+"'";
    }

    client.query(query, function(err,response) {
    var parsedResponse = parseInfluxData(response);
            done(null,parsedResponse);
        });
    });

  function parseInfluxData(data) {
    var columns = data[0].columns;
    var points  = data[0].points;
    var patternIndex = columns.indexOf("pattern");

    var result = [];
    var count = 1;
    var countedRoles = [];

    for(var i = 0; i<points.length; i++) {

      var containsRole = _.contains(countedRoles,points[i][patternIndex]);

      if(!containsRole) {
        result.push({pattern:points[i][patternIndex],
                     count:count
                    });
        countedRoles.push(points[i][patternIndex]);
      } else {

        for(var j = 0; j < result.length; j++) {
          if(result[j].pattern === points[i][patternIndex]) {
            result[j].count++;
          }
        }
    }

    }
    return result;
  }

  return {
    name: plugin
  }
}
