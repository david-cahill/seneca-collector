/* Copyright (c) 2014 Richard Rodger, MIT License */
"use strict";

var seneca = require('seneca')({log:'silent'});
var proxyquire = require('proxyquire');
seneca.use('..');
var assert = require('assert');

var influxStub = function(cfg) {
	return {
  	writePoint:function(seriesName, point, options, cb) {
    	return cb(null, {data:'received'});
  	},
    query:function(query, cb) {
      return cb(null, {point:{x:20, y:30}});
    }
  }
};

var collector = proxyquire('../collector', { influx: influxStub });

describe('collector', function() {

  it('happy',function(done){
    seneca.act('role:collector,ping:true',function(err,out){
      if(err) return done(err);
      assert.ok( out.now )
      done()
    })
  });

  it('write a point to InfluxDB', function(done) {
    var client = influxStub({host:'host', user:'username', pass:'password'});
    client.writePoint('seriesName', 'point', 'options', function(err, response) {
      assert.equal(response.data, 'received');
      done(); 
    })
  });

  it('query InfluxDB', function(done) {
    var client = influxStub({host:'host', user:'username', pass:'password'});
    client.query('x', function(err, response) {
      assert.equal(response.point.x, 20);
      assert.equal(response.point.y, 30);
      done();
    }); 
  });

});
