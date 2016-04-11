'use strict';

const request = require('supertest');
const app = require('./app');
const la = require('lazy-ass');

const USERNAME = 'user@company.com'
const PASSWORD = 'test'

function grabToken (html) {
  // name="csrfmiddlewaretoken" value="mC5xkDZW-X9GyTxAkYSbFN2_YejfWElWZtnU"
  const reg = /name="csrfmiddlewaretoken" value="([\w\W]{36})"/
  const matches = reg.exec(html)
  return matches[1]
}

describe('grab token', function () {
  it('works in simple html', function () {
    const html = require('fs').readFileSync(__dirname + '/example.html')
    const token = grabToken(html)
    la(token === 'mC5xkDZW-X9GyTxAkYSbFN2_YejfWElWZtnU',
      'wrong token', token)
  })
})

describe('GET /', function(){
  it('responds with json', function(done){
    request(app)
      .get('/')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, done);
  })

  it('has session counter', function(done){
    request(app)
      .get('/')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, {
        text: 'hi there',
        views: 1
      })
      .expect(200, done);
  })
})

describe('login', function () {
  it('has login page', function(done){
    request(app)
      .get('/login')
      .expect('Content-Type', /html/)
      .expect(200, done);
  })

  it('cannot login without CSRF token', function (done) {
    request(app)
      .post('/login')
      .field('email', USERNAME)
      .field('password', PASSWORD)
      .expect(403, done)
  })

  describe('get token then login', function () {
    var agent = request.agent(app)
    var token

    it('can grab CSRF token from login page', function (done) {
      agent
        .get('/login')
        .expect(function (res) {
          token = grabToken(res.text)
          la(token, 'could not grab token from', res.text)
          console.log('login response token', token)
        })
        .expect(200, done)
    })

    it('can login into the page using extracted token', function (done) {
      la(token, 'missing csrf token to use', token)
      console.log('using token', token)
      agent
        .post('/login')
        .type('form')
        .send({
          email: USERNAME,
          password: PASSWORD,
          csrfmiddlewaretoken: token
        })
        .expect(200, done)
    })

    it('shows user name after login', function (done) {
      agent
        .get('/')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200, {
          text: 'hi there',
          views: 1,
          user: USERNAME
        })
        .expect(200, done)
    })
  })
})
