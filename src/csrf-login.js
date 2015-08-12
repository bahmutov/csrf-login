require('lazy-ass');
var check = require('check-more-types');

var conf = require('./config');
var host = conf.get('host');
la(check.unemptyString(host), 'missing host', host);

var join = require('path').join;
var request = require('request');
var Promise = require('bluebird');

function csrfLogin() {

  var jar = request.jar();
  request = request.defaults({
    jar: jar
  });
  request.__jar = jar;

  function getCsrf(url) {
    var LOGIN_FORM_ID = conf.get('loginFormId');
    la(check.unemptyString(LOGIN_FORM_ID), 'missing login form id', LOGIN_FORM_ID);

    var CSRF_TOKEN_NAME = conf.get('tokenFieldName');
    la(check.unemptyString(CSRF_TOKEN_NAME), 'missing token field name');

    return new Promise(function (resolve, reject) {
      console.log('fetching page', url);
      request(url, function (error, response, body) {
        if (error) {
          return reject(error);
        }
        // console.log('body', body);
        var cheerio = require('cheerio');
        var $ = cheerio.load(body);
        var form = $('form[id="' + LOGIN_FORM_ID + '"]');
        if (!form) {
          return reject(new Error('Could not find login form'));
        }
        var csrf = $('input[name="' + CSRF_TOKEN_NAME + '"]').val();
        if (!csrf) {
          return reject(new Error('Could not find hidden input for login'));
        }
        resolve({
          method: form.attr('method'),
          url: form.attr('action'),
          csrf: csrf,
          csrfName: CSRF_TOKEN_NAME
        });
      });

    });
  }

  function login(csrfInfo, answers) {
    console.log('trying to login', answers.email);

    // need to set BOTH csrftoken cookie and csrfmiddlewaretoken input fields

    var loginUrl = host + csrfInfo.url;
    var form = {};
    form[csrfInfo.csrfName] = csrfInfo.csrf;
    form.email = answers.email;
    form.password = answers.password;

    request.__jar.setCookie(request.cookie('csrftoken=' + csrfInfo.csrf), loginUrl);
    var options = {
      url: loginUrl,
      formData: form,
      followRedirect: true
    };

    return new Promise(function (resolve, reject) {
      request.post(options, function (error, response, body) {
        if (error) {
          console.error(error);
          return reject(error);
        }
        resolve({
          request: request,
          response: response
        });
      });
    });
  }

  function loginUser(url) {
    var inq = require('inquirer');

    var questions = [{
      name: 'email',
      type: 'input',
      message: 'your email'
    }, {
      name: 'password',
      type: 'password',
      message: 'your password'
    }];

    console.log('Login to', loginUrl);
    return new Promise(function (resolve) {
      inq.prompt(questions, resolve);
    });
  }

  var loginUrl = host + conf.get('loginPath');
  return getCsrf(loginUrl)
    .tap(function (form) {
      console.log('found csrf toke', form);
    })
    .then(function (form) {
      return loginUser(loginUrl)
        .then(function (answers) {
          return login(form, answers);
        });
    });
}

module.exports = csrfLogin;


