# csrf-login

> Login from command line to the websites that use CSRF protection

[![NPM][csrf-login-icon] ][csrf-login-url]

[![Build status][csrf-login-ci-image] ][csrf-login-ci-url]
[![dependencies][csrf-login-dependencies-image] ][csrf-login-dependencies-url]
[![devdependencies][csrf-login-devdependencies-image] ][csrf-login-devdependencies-url]
[![semantic-release][semantic-image] ][semantic-url]
[![manpm](https://img.shields.io/badge/manpm-%E2%9C%93-3399ff.svg)](https://github.com/bahmutov/manpm)

## Why

CSRF tokens are a good security practice. A login form page contains a hidden input
field that is sent together with the username / password pair. The server checks if
the sent data contains the valid CSRF field before trying to authenticate the user.

    <form method="POST" action="/login/" id="loginform">
        <input type="hidden" name="csrfmiddlewaretoken" value="<long random hash>"" />
        <input type="email" name="email" />
        <input type="password" name="password" />
    </form>

There are two components to the protection: the hidden input value and a cookie. In order to
successfully execute requests, for example the login POST, one needs to fetch the login page,
grab the middleware token and use it to form the valid POST request, plus use the same value
as a cookie when making the POST request!

**csrf-login** allows you to login from command line to websites that use CSRF token protection.

## Install and use

Install and use under Node

    npm install csrf-login --save

Create a new file `csrf.json` in the current working folder, place the following custom parameters 
into this configuration file. For example,

```json
{
  "host": "http://my-dev-server:3000",
  "loginFormId": "loginform",
  "tokenFieldName": "csrfmiddlewaretoken",
  "loginPath": "/accounts/login/"
}
```

You can take a look at the defaults in [src/defaults.json](src/defaults.json)

From your code use the function

```js
var csrfLogin = require('csrf-login');
csrfLogin({
    username: username,
    password: password
}).then(function (info) {
  // info = { request, requestAsync, response, conf };
  return info.requestAsync('/api/foo', { some: params });      
}).then(function (data) { });
```

To get username and password from the user, you can use 
[get-username-and-password](https://github.com/bahmutov/get-username-and-password).

## Returned object

The returned object `info` has 3 properties

**response** - the response from the login call

**request** - the [request](https://www.npmjs.com/package/request) function you can use
to execute other API calls (the session cookie is set for example)

```js
csrfLogin()
  .then(function (info) {
    info.request('/some/other/end/point', function (error, response, body) {
      //Act on the response...
    });
  });
```

If you want to use promises instead of callbacks, use the `requestAsync` property

**requestAsync** - same [request](https://www.npmjs.com/package/request) object, but wrapped
in a promise-returning function. For example to make another API JSON request

```js
csrfLogin()
  .then(function (info) {
    return info.requestAsync({
      url: '/some/data/api',
      json: true
    });
  })
  .then(function (data) {
    console.log('got data from /some/data/api');
    console.log(data);
  })
  .catch(onError)
  .done();
```

**config** - full configuration object, created from `csrf.json`, environment and
command line arguments. Uses [nconf](https://www.npmjs.com/package/nconf). One
can get the `host` for example

```js
csrfLogin()
  .then(function (info) {
    console.log('logged into', info.get('host'));
  });
```

If you need to debug the login process, run the module with debug logging option

    DEBUG=csrf node client.js

### Small print

Author: Gleb Bahmutov &copy; 2015

* [@bahmutov](https://twitter.com/bahmutov)
* [glebbahmutov.com](http://glebbahmutov.com)
* [blog](http://glebbahmutov.com/blog/)

License: MIT - do anything with the code, but don't blame me if it does not work.

Spread the word: tweet, star on github, etc.

Support: if you find any problems with this module, email / tweet /
[open issue](https://github.com/bahmutov/csrf-login/issues) on Github

## Optional Configuration

By default, a form is looked up by Id and the submitted login form fields are expected to be named `email` and `password`. You can override these defaults in the config using the `loginFormSelector`, `loginUsernameField`, and `loginPasswordField`.

```js
{
  "host": "http://my-dev-server:3000",
  "loginFormSelector": "class='myForm'",
  "loginUsernameField": "username",
  "loginPasswordField": "userPassword",
  "tokenFieldName": "csrfmiddlewaretoken",
  "loginPath": "/accounts/login/"
}
```

## MIT License

Copyright (c) 2015 Gleb Bahmutov

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.

[csrf-login-icon]: https://nodei.co/npm/csrf-login.png?downloads=true
[csrf-login-url]: https://npmjs.org/package/csrf-login
[csrf-login-ci-image]: https://travis-ci.org/bahmutov/csrf-login.png?branch=master
[csrf-login-ci-url]: https://travis-ci.org/bahmutov/csrf-login
[csrf-login-dependencies-image]: https://david-dm.org/bahmutov/csrf-login.png
[csrf-login-dependencies-url]: https://david-dm.org/bahmutov/csrf-login
[csrf-login-devdependencies-image]: https://david-dm.org/bahmutov/csrf-login/dev-status.png
[csrf-login-devdependencies-url]: https://david-dm.org/bahmutov/csrf-login#info=devDependencies
[semantic-image]: https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg
[semantic-url]: https://github.com/semantic-release/semantic-release
