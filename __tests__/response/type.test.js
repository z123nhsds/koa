'use strict'

const { describe, it, after } = require('node:test')
const assert = require('node:assert/strict')
const Stream = require('node:stream')
const Koa = require('../..')
const request = require('supertest')
const context = require('../../test-helpers/context')

describe('ctx.type=', () => {
  describe('with a mime', () => {
    it('should set the Content-Type', () => {
      const ctx = context()
      ctx.type = 'text/plain'
      assert.strictEqual(ctx.type, 'text/plain')
      assert.strictEqual(ctx.response.header['content-type'], 'text/plain; charset=utf-8')
    })
  })

  describe('with an extension', () => {
    it('should lookup the mime', () => {
      const ctx = context()
      ctx.type = 'json'
      assert.strictEqual(ctx.type, 'application/json')
      assert.strictEqual(ctx.response.header['content-type'], 'application/json; charset=utf-8')
    })
  })

  describe('without a charset', () => {
    it('should default the charset', () => {
      const ctx = context()
      ctx.type = 'text/html'
      assert.strictEqual(ctx.type, 'text/html')
      assert.strictEqual(ctx.response.header['content-type'], 'text/html; charset=utf-8')
    })
  })

  describe('with a charset', () => {
    it('should not default the charset', () => {
      const ctx = context()
      ctx.type = 'text/html; charset=foo'
      assert.strictEqual(ctx.type, 'text/html')
      assert.strictEqual(ctx.response.header['content-type'], 'text/html; charset=foo')
    })
  })

  describe('with an unknown extension', () => {
    it('should not set a content-type', () => {
      const ctx = context()
      ctx.type = 'asdf'
      assert(!ctx.type)
      assert(!ctx.response.header['content-type'])
    })
  })
})

describe('ctx.type', () => {
  describe('with no Content-Type', () => {
    it('should return ""', () => {
      const ctx = context()
      assert(!ctx.type)
    })
  })

  describe('with a Content-Type', () => {
    it('should return the mime', () => {
      const ctx = context()
      ctx.type = 'json'
      assert.strictEqual(ctx.type, 'application/json')
    })
  })

  describe('when setting to +json content type', () => {
    it('should set the content type to json', () => {
      const ctx = context()
      ctx.type = 'application/vnd.myapi.v1+json'
      assert.strictEqual(ctx.type, 'application/vnd.myapi.v1+json')
    })
  })
})

describe('response.typeOnce', () => {
  describe('when _typeOnce is false (default)', () => {
    it('should overwrite existing Content-Type', () => {
      const ctx = context()
      ctx.type = 'text/plain'
      assert.strictEqual(ctx.type, 'text/plain')
      ctx.type = 'application/json'
      assert.strictEqual(ctx.type, 'application/json')
      assert.strictEqual(ctx.response.header['content-type'], 'application/json; charset=utf-8')
    })

    it('should not set content-type for unknown extension', () => {
      const ctx = context()
      ctx.type = 'text/plain'
      assert.strictEqual(ctx.type, 'text/plain')
      ctx.type = 'asdf'
      assert(!ctx.type)
      assert.strictEqual(ctx.response.header['content-type'], 'text/plain; charset=utf-8')
    })
  })

  describe('when _typeOnce is true', () => {
    it('should not overwrite existing Content-Type', () => {
      const ctx = context()
      ctx.response._typeOnce = true
      ctx.type = 'text/plain'
      assert.strictEqual(ctx.type, 'text/plain')
      ctx.type = 'application/json'
      assert.strictEqual(ctx.type, 'text/plain')
      assert.strictEqual(ctx.response.header['content-type'], 'text/plain; charset=utf-8')
    })

    it('should set Content-Type when not already set', () => {
      const ctx = context()
      ctx.response._typeOnce = true
      ctx.type = 'text/html'
      assert.strictEqual(ctx.type, 'text/html')
      assert.strictEqual(ctx.response.header['content-type'], 'text/html; charset=utf-8')
    })

    it('should not set content-type for unknown extension', () => {
      const ctx = context()
      ctx.response._typeOnce = true
      ctx.type = 'asdf'
      assert(!ctx.type)
      assert(!ctx.response.header['content-type'])
    })

    it('should not overwrite Content-Type set via set()', () => {
      const ctx = context()
      ctx.response._typeOnce = true
      ctx.set('Content-Type', 'text/plain; charset=utf-8')
      ctx.type = 'application/json'
      assert.strictEqual(ctx.type, 'text/plain')
      assert.strictEqual(ctx.response.header['content-type'], 'text/plain; charset=utf-8')
    })
  })

  describe('with body auto-inference', () => {
    it('should infer type for string body when Content-Type not set', () => {
      const ctx = context()
      ctx.response._typeOnce = true
      ctx.body = '<h1>hello</h1>'
      assert.strictEqual(ctx.type, 'text/html')
      assert.strictEqual(ctx.response.header['content-type'], 'text/html; charset=utf-8')
    })

    it('should not overwrite type for string body when Content-Type already set', () => {
      const ctx = context()
      ctx.response._typeOnce = true
      ctx.type = 'text/plain'
      ctx.body = '<h1>hello</h1>'
      assert.strictEqual(ctx.type, 'text/plain')
      assert.strictEqual(ctx.response.header['content-type'], 'text/plain; charset=utf-8')
    })

    it('should infer type for stream body when Content-Type not set', () => {
      const ctx = context()
      ctx.response._typeOnce = true
      ctx.body = new Stream.PassThrough()
      assert.strictEqual(ctx.type, 'application/octet-stream')
    })

    it('should not overwrite type for stream body when Content-Type already set', () => {
      const ctx = context()
      ctx.response._typeOnce = true
      ctx.type = 'image/png'
      ctx.body = new Stream.PassThrough()
      assert.strictEqual(ctx.type, 'image/png')
    })

    it('should infer type for buffer body when Content-Type not set', () => {
      const ctx = context()
      ctx.response._typeOnce = true
      ctx.body = Buffer.from('hello')
      assert.strictEqual(ctx.type, 'application/octet-stream')
    })

    it('should not overwrite type for buffer body when Content-Type already set', () => {
      const ctx = context()
      ctx.response._typeOnce = true
      ctx.type = 'text/plain'
      ctx.body = Buffer.from('hello')
      assert.strictEqual(ctx.type, 'text/plain')
      assert.strictEqual(ctx.response.header['content-type'], 'text/plain; charset=utf-8')
    })
  })

  describe('with middleware onion model', () => {
    let server
    let app

    after(() => {
      if (server) server.close()
    })

    it('should not break middleware execution order', async () => {
      app = new Koa({ response: { typeOnce: true } })
      const order = []

      app.use(async (ctx, next) => {
        order.push('mw1-before')
        ctx.type = 'text/plain'
        await next()
        order.push('mw1-after')
        assert.strictEqual(ctx.type, 'text/plain')
      })

      app.use(async (ctx, next) => {
        order.push('mw2-before')
        ctx.type = 'application/json'
        await next()
        order.push('mw2-after')
      })

      app.use(async (ctx) => {
        order.push('mw3')
        ctx.body = 'hello'
      })

      server = app.listen()
      await request(server)
        .get('/')
        .expect(200)
        .expect('content-type', /text\/plain/)
      assert.deepStrictEqual(order, ['mw1-before', 'mw2-before', 'mw3', 'mw2-after', 'mw1-after'])
    })

    it('should allow downstream middleware to set the first Content-Type', async () => {
      app = new Koa({ response: { typeOnce: true } })
      const order = []

      app.use(async (ctx, next) => {
        order.push('mw1-before')
        await next()
        order.push('mw1-after')
        assert.strictEqual(ctx.type, 'application/json')
      })

      app.use(async (ctx, next) => {
        order.push('mw2-before')
        ctx.type = 'application/json'
        await next()
        order.push('mw2-after')
      })

      app.use(async (ctx) => {
        order.push('mw3')
        ctx.type = 'text/plain'
        ctx.body = 'hello'
      })

      server = app.listen()
      await request(server)
        .get('/')
        .expect(200)
        .expect('content-type', /application\/json/)
      assert.deepStrictEqual(order, ['mw1-before', 'mw2-before', 'mw3', 'mw2-after', 'mw1-after'])
    })

    it('should allow upstream middleware to set Content-Type', async () => {
      app = new Koa({ response: { typeOnce: true } })

      app.use(async (ctx, next) => {
        ctx.type = 'text/html'
        await next()
        assert.strictEqual(ctx.type, 'text/html')
      })

      app.use(async (ctx) => {
        ctx.type = 'application/json'
        ctx.body = '<h1>hello</h1>'
      })

      server = app.listen()
      await request(server)
        .get('/')
        .expect(200)
        .expect('content-type', /text\/html/)
    })

    it('should respect typeOnce=false overriding behavior in middleware', async () => {
      app = new Koa({ response: { typeOnce: false } })

      app.use(async (ctx, next) => {
        ctx.type = 'text/html'
        await next()
        assert.strictEqual(ctx.type, 'application/json')
      })

      app.use(async (ctx) => {
        ctx.type = 'application/json'
        ctx.body = '{"ok":true}'
      })

      server = app.listen()
      await request(server)
        .get('/')
        .expect(200)
        .expect('content-type', /application\/json/)
    })
  })

  describe('Application option integration', () => {
    it('should default to false when not specified', () => {
      const app = new Koa()
      assert.strictEqual(app.response._typeOnce, false)
    })

    it('should set _typeOnce to true when response.typeOnce is true', () => {
      const app = new Koa({ response: { typeOnce: true } })
      assert.strictEqual(app.response._typeOnce, true)
    })

    it('should set _typeOnce to false when response.typeOnce is false', () => {
      const app = new Koa({ response: { typeOnce: false } })
      assert.strictEqual(app.response._typeOnce, false)
    })

    it('should propagate _typeOnce to per-request context', () => {
      const app = new Koa({ response: { typeOnce: true } })
      const ctx = context(null, null, app)
      assert.strictEqual(ctx.response._typeOnce, true)
    })
  })
})
