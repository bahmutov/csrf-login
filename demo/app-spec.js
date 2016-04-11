'use strict';

const request = require('supertest');
const app = require('./app');
const la = require('lazy-ass');

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
      .field('email', 'user@company.com')
      .field('password', 'test')
      .expect(403, done)
  })

  describe.only('get token then login', function () {
    var agent = request.agent(app)
    var token

    it('can grab CSRF token from login page', function (done) {
      request(app)
        .get('/login')
        .expect(function (res) {
          console.log('login response')
          token = grabToken(res.text)
          la(token, 'could not grab token from', res.text)
        })
        .expect(200, done)
        // .post('/login')
        // .field('email', 'user@company.com')
        // .field('password', 'test')
        // .expect(403, done)
    })
  })
})
