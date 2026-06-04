const Koa = require('./lib/application');
const http = require('http');

const app = new Koa();

app.use(async (ctx) => {
  // 先使用 ctx.set 设置 Content-Type
  ctx.set('Content-Type', 'text/plain');
  
  // 然后给 ctx.body 赋值一个对象，这会触发 Koa 自动设置 application/json
  ctx.body = { hello: 'world' };
});

const server = app.listen(0, () => {
  console.log(`Server listening on port ${server.address().port}`);
  
  // 发送请求测试
  const options = {
    hostname: 'localhost',
    port: server.address().port,
    path: '/',
    method: 'GET'
  };
  
  const req = http.request(options, (res) => {
    console.log('Status Code:', res.statusCode);
    console.log('Response Headers:', res.headers);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('Response Body:', data);
      server.close();
    });
  });
  
  req.end();
});
