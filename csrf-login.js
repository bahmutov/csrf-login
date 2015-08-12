require('lazy-ass');
var check = require('check-more-types');

var findFirst = require('first-existing');
var candidateFiles = ['.csrf.json', 'csrf.json', 'csrf-login.json'];
var foundFile = findFirst.apply(null, candidateFiles);
la(check.unemptyString(foundFile), 'missing config file,',
  'pick at least one filename and create', candidateFiles.join(' '));
