# seneca-collector

### Node.js Seneca Collector

This module is a plugin for the [Seneca
framework](http://senecajs.org). It provides a message throughput statistics.

Current Version: 0.1.0

Tested on: Seneca 0.6.0, Node 0.10.29


### Quick example


```JavaScript
var seneca = require('seneca')();
var collector = require('seneca-collector');
var influxOptions = { host:'localhost',
                      port: 8086,
                      username:'root',
                      password:'root',
                      database:'test_db',
                      seriesName:'test_series'
                    };
seneca.use(collector,influxOptions);
```

## Install

```sh
npm install seneca
npm install seneca-collector
```


## Test

```bash
mocha test/*.test.js
```
