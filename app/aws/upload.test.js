'use strict';

// NPM dependencies
const expect = require('chai').expect;
const supertest = require('supertest');
const fs = require('fs');
const path = require('path');
const { describe, it } = require('mocha');

// Local dependencies
const getApp = require('../../server').getApp;

describe('POST /upload endpoint', () => {
  it('should return HTTP 400 status with appropriate error if no file and email are attached', (done) => {
    supertest(getApp())
      .post('/upload')
      .set('Accept', 'application/json')
      .expect(400)
      .expect((res) => {
        const response = JSON.parse(res.text);
        console.log(response);
        expect(response.error).to.equal('Both email and file are required');
      })
      .end(done);
  });

  it('should return HTTP 400 status with appropriate error when no file is attached', (done) => {
    supertest(getApp())
      .post('/upload')
      .set('Accept', 'application/json')
      .send({ email: 'example@email.com' })
      .expect(400)
      .expect((res) => {
        const response = JSON.parse(res.text);
        console.log(response);
        expect(response.error).to.equal('Both email and file are required');
      })
      .end(done);
  });

  it('should return HTTP 400 if no email is attached', (done) => {
    const filePath = path.join(__dirname, '../../example.zip');
    const fileData = fs.readFileSync(filePath);
    supertest(getApp())
      .post('/upload')
      .set('Accept', 'application/json')
      .attach('file', fileData, 'example.zip')
      .expect(400)
      .expect((res) => {
        const response = JSON.parse(res.text);
        console.log(response);
        expect(response.error).to.equal('Both email and file are required');
      })
      .end(done);
  });

  it('should return HTTP 200 status with correct response', (done) => {
    const filePath = path.join(__dirname, '../../example.zip');
    const fileData = fs.readFileSync(filePath);
    supertest(getApp())
      .post('/upload')
      .set('Accept', 'application/json')
      .field('email', 'example@email.com')
      .attach('file', fileData, 'example.zip')
      .expect(200)
      .expect((res) => {
        const response = JSON.parse(res.text);
        expect(response.email).to.equal('example@email.com');
        expect(response.fileCount).to.equal(2);
        expect(response.largestFileSize).to.equal('727957 bytes');
        expect(response.largestFileName).to.equal('floor-plan.pdf');
      })
      .end(done);
  });

  it('should return HTTP 400 if invalid file attached', (done) => {
    const filePath = path.join(__dirname, '../../test.txt');
    const fileData = fs.readFileSync(filePath);
    supertest(getApp())
      .post('/upload')
      .set('Accept', 'application/json')
      .field('email', 'example@email.com')
      .attach('file', fileData, 'test.txt')
      .expect(400)
      .expect((res) => {
        const response = JSON.parse(res.text);
        console.log(response);
        expect(response.error).to.equal('Only zip files are allowed');
      })
      .end(done);
  });

  it('should return HTTP 400 with invalid email format', (done) => {
    const filePath = path.join(__dirname, '../../example.zip');
    const fileData = fs.readFileSync(filePath);
    supertest(getApp())
      .post('/upload')
      .set('Accept', 'application/json')
      .field('email', 'invalidEmailFormat')
      .attach('file', fileData, 'example.zip')
      .expect(400)
      .expect((res) => {
        const response = JSON.parse(res.text);
        console.log(response);
        expect(response.error).to.equal('Invalid email address');
      })
      .end(done);
  });
});
