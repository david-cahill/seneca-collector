# seneca-collector

### Node.js Seneca Collector

This module is a plugin for the [Seneca
framework](http://senecajs.org). It provides a message throughput statistics.

Current Version: 0.1.0

Tested on: Seneca 0.6.0, Node 0.10.29


### Quick example


```JavaScript
var seneca = require('seneca')();
seneca.use('collector');
```

## Install

```sh
npm install seneca
npm install seneca-collector
```

## Message Patterns

Foo.

   * `role:msgstats, cmd:foo` foo

Bar.

### Options

```JavaScript
seneca.use('collector', {
  foo:'bar'
});
```



## Test

```bash
mocha test/*.test.js
```
