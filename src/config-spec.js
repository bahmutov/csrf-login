/* global describe, it, beforeEach */
var la = require('lazy-ass');
var is = require('check-more-types');

function bustCache(moduleName) {
  var Module = require('module');
  var fullName = Module._resolveFilename(moduleName, module);
  delete require.cache[fullName];
}

describe('config', function () {
  var nconf;

  beforeEach(function () {
    bustCache('nconf');
    nconf = require('nconf');
  });

  it('uses defaults', function () {
    nconf
      .env()
      .argv()
      .defaults({ foo: 'foo' });

    la(nconf.get('foo') === 'foo',
      'uses default foo value', nconf.get('foo'));
  });

  it('uses overrides value', function () {
    nconf.overrides({
      foo: 'bar'
    });

    nconf
      .env()
      .argv()
      .defaults({ foo: 'foo' });

    la(nconf.get('foo') === 'bar',
      'overriden value', nconf.get('foo'));
  });

  it('does not have initial value', function () {
    la(is.not.defined(nconf.get('foo')),
      'should not have initial value', nconf.get('foo'));
  });
});
