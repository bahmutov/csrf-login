var nconf = require('nconf');

function getConfig(options) {
  if (options) {
    nconf.overrides(options);
  }

  nconf.env().argv();

  var findFirst = require('first-existing');
  var candidateFiles = ['.csrf.json', 'csrf.json', '.csrf-login.json', 'csrf-login.json'];

  var foundFile = findFirst(process.cwd(), candidateFiles);
  if (!foundFile) {
    foundFile = findFirst(__dirname, candidateFiles, true);
  }
  if (foundFile) {
    nconf.file(foundFile);
  } else {
    console.error('warning: Could not find csrf settings file');
  }

  var join = require('path').join;
  var defaults = require(join(__dirname, 'defaults.json'));
  nconf.defaults(defaults);

  return nconf;
}

module.exports = getConfig;

if (!module.parent) {
  console.log('configuration data');
  console.log('host', nconf.get('host'));
  console.log('token field', nconf.get('tokenFieldName'));
}
