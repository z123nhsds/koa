const Koa = require('./lib/application');
const request = require('supertest');
const assert = require('node:assert/strict');

const app = new Koa();

app.use(ctx => {
  ctx.set({ 'Content-Type': ['text/html', 'text/plain'] });
  ctx.body = 'hello';
});

request(app.callback())
  .get('/')
  .end((err, res) => {
    console.log(res.headers['content-type']);
  });