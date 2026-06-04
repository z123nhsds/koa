const Koa = require('./lib/application');
const http = require('http');

const app = new Koa();

// 测试不同的组合
app.use(async (ctx) => {
  console.log('=== 测试 ===');
  
  // 场景 1: 先 set 然后 body 设为 object
  ctx.set('Content-Type', 'text/plain');
  console.log('1. 设为 text/plain 后:', ctx.response.headers);
  
  ctx.body = { hello: 'world' };
  console.log('2. body 设为 object 后:', ctx.response.headers);
  console.log('   ctx.type:', ctx.type);
  console.log('   ctx.get("Content-Type"):', ctx.get('Content-Type'));
  console.log('   res.headers:', ctx.res.getHeaders());
});

const server = app.listen(0, () => {
  console.log(`Server listening on port ${server.address().port}`);
  
  const options = {
    hostname: 'localhost',
    port: server.address().port,
    path: '/',
    method: 'GET'
  };
  
  const req = http.request(options, (res) => {
    console.log('\n=== 响应头 ===');
    console.log('Status Code:', res.statusCode);
    console.log('Response Headers:', res.headers);
    server.close();
  });
  
  req.end();
});
