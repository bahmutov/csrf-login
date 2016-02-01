var login = require('..');
var options = {
  loginFormId: 'loginform',
  tokenFieldName: 'csrfmiddlewaretoken',
  loginPath: '/key/accounts/login/',
  username: process.env.username,
  password: process.env.password,
  host: process.env.host
};

// to use, change the above options
// and pass the rest via command line, for example
// DEBUG=csrf username=user password=pass host=http://localhost:1337 node demo.js

console.log('trying to login', options.username, 'to', options.host);
login(options)
  .then(function (result) {
    console.log('logged in, jar is');
    console.log(result.jar._jar.store)
  })
  .done();

