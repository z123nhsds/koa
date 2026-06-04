'use strict'

/**
 * Reproduction script for multiple Content-Type values bug
 * 
 * Bug: Using ctx.append() or sequential ctx.set() + ctx.body can result
 * in multiple Content-Type header values, which violates HTTP spec.
 * 
 * HTTP spec states Content-Type must be a single value header.
 */

const Koa = require('./lib/application')
const http = require('http')

const app = new Koa()

app.use(async (ctx) => {
  // BUG REPRODUCTION: This code attempts to append multiple Content-Type values
  // Scenario 1: Using append() to add multiple Content-Type values
  ctx.set('Content-Type', 'text/html')
  ctx.append('Content-Type', 'text/plain')

  // Scenario 2 (alternative): Setting body after manual Content-Type can also
  // cause issues in certain edge cases
  // ctx.set('Content-Type', 'application/json')
  // ctx.body = 'hello world'

  ctx.body = 'Hello World'
})

const server = http.createServer(app.callback())

server.listen(0, () => {
  const address = server.address()
  const port = address.port

  console.log(`Server running at http://localhost:${port}`)
  console.log('Testing multiple Content-Type bug...\n')

  http.get(`http://localhost:${port}`, (res) => {
    console.log('Response headers:')
    console.log('Content-Type:', res.headers['content-type'])
    console.log('\nExpected: A single Content-Type value')
    console.log('Actual bug: May contain multiple values or cause assertion error')

    res.on('data', () => {})
    res.on('end', () => {
      server.close()
    })
  })
})
