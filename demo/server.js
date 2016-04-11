'use strict';

// demo server for showing CSRF login
var app = require('express')();
var helmet = require('helmet');
app.use(helmet())
app.use(require('morgan')('dev'));
var session = require('express-session');
var FileStore = require('session-file-store')(session);

app.use(session({
  name: 'server-session-cookie-id',
  secret: 'my express secret',
  saveUninitialized: true,
  resave: true,
  store: new FileStore()
}));

var csurf = require('csurf');
var csrfProtection = csurf();
app.get('/form', csrfProtection, function(req, res) {
  // pass the csrfToken to the view
  // res.send('send', { csrfToken: req.csrfToken() })
  res.send('form');
  console.log('csrf token', req.csrfToken());
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
    views: req.session.views
  });
});

var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Example app listening at http://%s:%s', host, port);
});
