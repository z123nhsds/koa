const Koa = require('./lib/application');
const app = new Koa();

app.use(ctx => {
  ctx.set({ 'Content-Type': ['text/html', 'text/plain'] });
  ctx.body = 'Hello Koa';
});

app.listen(3000, () => {
  console.log('Server running');
  const http = require('http');
  http.get('http://localhost:3000', (res) => {
    console.log(res.headers['content-type']);
    process.exit(0);
  });
});