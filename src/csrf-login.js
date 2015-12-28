require('lazy-ass');
var check = require('check-more-types');

var log = require('debug')('csrf');
var conf = require('./config');
var host = conf.get('host');
la(check.unemptyString(host), 'missing host', host);

var join = require('path').join;
var request = require('request');
var Promise = require('bluebird');

function csrfLogin(options) {
  options = options || {};

  var username = options.email || options.username;
  if (!username) {
    return Promise.reject('Missing username');
  }
  if (!options.password) {
    return Promise.reject('Missing password for ' + options);
  }

  var jar = request.jar();
  request = request.defaults({
    jar: jar,
    baseUrl: host
  });
  request.__jar = jar;

  function getCsrf(url) {
    var LOGIN_FORM_SELECTOR = conf.get('loginFormSelector');
    if (!LOGIN_FORM_SELECTOR) {    
      var LOGIN_FORM_ID = conf.get('loginFormId');
      la(check.unemptyString(LOGIN_FORM_ID), 'missing login form id', LOGIN_FORM_ID);
      LOGIN_FORM_SELECTOR = 'id="' + LOGIN_FORM_ID + '"';
    }

    var CSRF_TOKEN_NAME = conf.get('tokenFieldName');
    la(check.unemptyString(CSRF_TOKEN_NAME), 'missing token field name');

    return new Promise(function (resolve, reject) {
      log('fetching page', url);
      request(url, function (error, response, body) {
        if (error) {
          return reject(error);
        }
        // console.log('body', body);
        var cheerio = require('cheerio');
        var $ = cheerio.load(body);
        var form = $('form[' + LOGIN_FORM_SELECTOR + ']');
        if (!form) {
          return reject(new Error('Could not find login form'));
        }
        var csrf = $('input[name="' + CSRF_TOKEN_NAME + '"]').val();
        if (!csrf) {
          return reject(new Error('Could not find hidden input for login'));
        }

        var pageInfo = {
          method: form.attr('method'),
          url: form.attr('action') || url,
          csrf: csrf,
          csrfName: CSRF_TOKEN_NAME,
          headers: response.headers
        };
        log('login page info', pageInfo);
        resolve(pageInfo);
      });

    });
  }

  function login(csrfInfo, answers) {
    var username = answers.email || answers.username;
    if (!username) {
      return Promise.reject('Missing username');
    }
    if (!answers.password) {
      return Promise.reject('Missing password for ' + username);
    }
    log('trying to login %s', username);

    // need to set BOTH csrftoken cookie and csrfmiddlewaretoken input fields
    var loginUrl = csrfInfo.url;
    var form = {};
    form[csrfInfo.csrfName] = csrfInfo.csrf;
    form.email = username;
    form.password = answers.password;

    request.__jar.setCookie(request.cookie('csrftoken=' + csrfInfo.csrf), loginUrl);
    var options = {
      url: loginUrl,
      formData: form,
      followRedirect: true,
      headers: {
        referer: host
      }
    };

    function requestAsync(options) {
      log('making async request with options', options);

      return new Promise(function (resolve, reject) {
        request(options, function (error, response) {
          if (error) {
            return reject(error);
          }
          resolve(response);
        });
      });
    }

    return new Promise(function (resolve, reject) {
      request.post(options, function onLoggedIn(error, response, body) {
        if (error) {
          console.error(error);
          return reject(error);
        }
        if (response.statusCode === 403) {
          log('login has received 403');
          log(body);
          log('original login options', options);

          console.error('Could not login', response.statusCode, response.statusMessage);
          return reject(new Error(response.statusCode + ': ' + response.statusMessage));
        }
        resolve({
          request: request,
          requestAsync: requestAsync,
          response: response,
          config: conf
        });
      });
    });
  }

  var loginUrl = conf.get('loginPath');
  return getCsrf(loginUrl)
    .tap(function (form) {
      log('csrf info', form);
    })
    .then(function (form) {
      log('Login to %s %s', host, loginUrl);
      var username = options.username || options.email;
      var password = options.password;
      return login(form, {
        username: username,
        password: password
      });
    });
}

module.exports = csrfLogin;

