'use strict';

const request = require('supertest');
const app = require('./app');

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
})
