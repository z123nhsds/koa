// score: 0
const Koa = require('./lib/application')
const fs = require('node:fs')

if (!fs.existsSync('data.xml')) {
  fs.writeFileSync('data.xml', '<?xml version="1.0" encoding="UTF-8"?><data><message>Hello XML</message></data>\n')
}

const app = new Koa()

app.use(async (ctx, next) => {
  const start = Date.now()
  await next()
  const ms = Date.now() - start
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
})

app.use(async ctx => {
  ctx.assert(ctx.get('Accept').includes('application/xml'), 406, 'Not Acceptable')
  ctx.type = 'xml'
  ctx.body = fs.createReadStream('data.xml')
})

app.listen(3000)
