'use strict';

var app = require('express')();
var helmet = require('helmet');
var bodyParser = require('body-parser');
var parseForm = bodyParser.urlencoded({ extended: false })

app.use(helmet())
app.use(require('morgan')('dev'));
var session = require('express-session');
var FileStore = require('session-file-store')(session);

app.set('view engine', 'pug');
app.set('views', __dirname + '/views');
app.locals.pretty = true;

app.use(session({
  name: 'server-session-cookie-id',
  secret: 'my express secret',
  saveUninitialized: true,
  resave: true,
  store: new FileStore()
}));

var csurf = require('csurf');
var csrfProtection = csurf({
  value: function getCSRF (req) {
    console.log('returning csrf token from the request');
    console.log(req.body);
    return req.body.csrfmiddlewaretoken;
  }
});

function send403(res) {
  return res.status(403).send('User is not authorized');
}

app.get('/login', csrfProtection, function(req, res) {
  console.log('csrf token', req.csrfToken());
  res.render('login', { csrfToken: req.csrfToken() });
});

app.post('/login', parseForm, csrfProtection, function (req, res) {
  console.log('login post', req.body);
  if (req.body.email === 'user@company.com' &&
    req.body.password === 'test') {
    console.log('successfully logged in user', req.body.email);
    req.session.user = req.body.email;
    return res.send('logged in');
  } else {
    console.log('failed login for user', req.body.email);
    return res.redirect('/login');
  }
});

app.get('/logout', isLoggedIn, csrfProtection, function(req, res) {
  console.log('logout', req.session.user);
  req.session.destroy();
  res.redirect('/login');
});

app.use(function printSession(req, res, next) {
  console.log('req.session', req.session);
  return next();
});

app.get('/', function (req, res, next) {
  if (typeof req.session.views === 'undefined') {
    req.session.views = 0;
  }
  req.session.views += 1;
  return next();
})

app.get('/', function (req, res) {
  // res.send('Hi there, session views count ' + req.session.views);
  res.send({
    text: 'hi there',
    views: req.session.views,
    user: req.session.user
  });
});

// a protected api method
function isLoggedIn (req, res, next) {
  if (req.session.user) {
    console.log('has user');
    return next();
  }
  return send403(res);
}
app.get('/api', isLoggedIn, function (req, res) {
  res.send({
    text: 'protected api call',
    username: req.session.user,
    ok: true
  });
});

module.exports = app;
