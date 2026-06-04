// score: 0
import Koa from 'koa';
import fs from 'fs';

const app = new Koa();

const logger = async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`);
};

app.use(logger);

app.use(async (ctx) => {
  ctx.assert(ctx.accepts('xml'), 406, 'Not Acceptable');
  ctx.type = 'xml';
  ctx.body = fs.createReadStream('data.xml');
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
