var nconf = require('nconf');
nconf.env().argv();

var findFirst = require('first-existing');
var candidateFiles = ['.csrf.json', 'csrf.json', '.csrf-login.json', 'csrf-login.json'];
var foundFile = findFirst.apply(null, candidateFiles);
if (foundFile) {
  nconf.file(foundFile);
}

var join = require('path').join;
var defaults = require(join(__dirname, 'defaults.json'));
nconf.defaults(defaults);

module.exports = nconf;

if (!module.parent) {
  console.log('configuration data');
  console.log('host', nconf.get('host'));
  console.log('token field', nconf.get('tokenFieldName'));
}
