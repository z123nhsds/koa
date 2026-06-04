'use strict'

const { describe, it } = require('node:test')
const assert = require('node:assert')
const Koa = require('../../lib/application')
const context = require('../../test-helpers/context')

describe('ctx.typeOnce', () => {
  describe('default value', () => {
    it('should be false by default', () => {
      const ctx = context()
      assert.strictEqual(ctx.response.typeOnce, false)
    })
  })

  describe('when enabled', () => {
    it('should skip setting type when Content-Type already exists', () => {
      const ctx = context()
      ctx.response.typeOnce = true
      ctx.type = 'text/html'
      assert.strictEqual(ctx.type, 'text/html')

      ctx.type = 'application/json'
      assert.strictEqual(ctx.type, 'text/html')
    })

    it('should allow setting type when no Content-Type exists', () => {
      const ctx = context()
      ctx.response.typeOnce = true
      ctx.type = 'application/json'
      assert.strictEqual(ctx.type, 'application/json')
    })

    it('should respect manual Content-Type header set via set()', () => {
      const ctx = context()
      ctx.response.typeOnce = true
      ctx.set('Content-Type', 'text/xml')
      ctx.type = 'application/json'
      assert.strictEqual(ctx.type, 'text/xml')
    })

    it('should allow removing Content-Type then setting new type', () => {
      const ctx = context()
      ctx.response.typeOnce = true
      ctx.type = 'text/html'
      ctx.remove('Content-Type')
      ctx.type = 'application/json'
      assert.strictEqual(ctx.type, 'application/json')
    })

    it('should work with unknown extensions (no Content-Type set)', () => {
      const ctx = context()
      ctx.response.typeOnce = true
      ctx.type = 'asdf'
      assert(!ctx.type)
      assert(!ctx.response.header['content-type'])
    })
  })

  describe('when disabled (default)', () => {
    it('should overwrite existing Content-Type', () => {
      const ctx = context()
      ctx.type = 'text/html'
      assert.strictEqual(ctx.type, 'text/html')

      ctx.type = 'application/json'
      assert.strictEqual(ctx.type, 'application/json')
    })
  })
})

describe('ctx.typeOnce with app-level configuration', () => {
  it('should inherit typeOnce from app.response prototype', () => {
    const app = new Koa()
    app.response.typeOnce = true
    const ctx = context(undefined, undefined, app)
    assert.strictEqual(ctx.response.typeOnce, true)
  })

  it('should allow per-request override of app-level setting', () => {
    const app = new Koa()
    app.response.typeOnce = true
    const ctx = context(undefined, undefined, app)
    ctx.response.typeOnce = false
    ctx.type = 'text/html'
    ctx.type = 'application/json'
    assert.strictEqual(ctx.type, 'application/json')
  })
})

describe('ctx.typeOnce with ctx.body auto-inference', () => {
  it('should not interfere with body type inference when typeOnce is enabled', () => {
    const ctx = context()
    ctx.response.typeOnce = true
    ctx.body = '<h1>Hello</h1>'
    assert.strictEqual(ctx.type, 'text/html')
  })

  it('should allow middleware to set type before body assignment', () => {
    const ctx = context()
    ctx.response.typeOnce = true
    ctx.type = 'text/xml'
    ctx.body = '<root>data</root>'
    assert.strictEqual(ctx.type, 'text/xml')
  })

  it('should preserve earlier middleware type when later middleware sets body', () => {
    const ctx = context()
    ctx.response.typeOnce = true
    ctx.type = 'application/xml'
    ctx.body = { foo: 'bar' }
    assert.strictEqual(ctx.type, 'application/xml')
  })

  it('should allow body to set type when no prior type exists', () => {
    const ctx = context()
    ctx.response.typeOnce = true
    ctx.body = { foo: 'bar' }
    assert.strictEqual(ctx.type, 'application/json')
  })

  it('should handle stream body with pre-set type', () => {
    const ctx = context()
    ctx.response.typeOnce = true
    ctx.type = 'application/octet-stream'
    const stream = require('stream').Readable.from(['data'])
    ctx.body = stream
    assert.strictEqual(ctx.type, 'application/octet-stream')
  })

  it('should handle null body correctly', () => {
    const ctx = context()
    ctx.response.typeOnce = true
    ctx.type = 'text/html'
    ctx.body = null
    assert(!ctx.type)
  })

  it('should handle Buffer body correctly', () => {
    const ctx = context()
    ctx.response.typeOnce = true
    ctx.body = Buffer.from('hello')
    assert.strictEqual(ctx.type, 'application/octet-stream')
  })
})

describe('ctx.typeOnce middleware onion model compatibility', () => {
  it('should protect inner middleware type from outer middleware overwrite', async () => {
    const Koa = require('../../lib/application')
    const app = new Koa()
    app.response.typeOnce = true

    app.use(async (ctx, next) => {
      await next()
      ctx.type = 'text/plain'
    })

    app.use(async (ctx, next) => {
      ctx.type = 'application/json'
      ctx.body = { message: 'hello' }
    })

    const ctx = context(undefined, undefined, app)
    await app.middleware[0](ctx, async () => {
      await app.middleware[1](ctx, async () => {})
    })

    assert.strictEqual(ctx.type, 'application/json')
  })

  it('should allow outer middleware to set type before inner middleware runs', async () => {
    const Koa = require('../../lib/application')
    const app = new Koa()
    app.response.typeOnce = true

    app.use(async (ctx, next) => {
      ctx.type = 'text/html'
      await next()
    })

    app.use(async (ctx, next) => {
      ctx.body = '<h1>Inner</h1>'
    })

    const ctx = context(undefined, undefined, app)
    await app.middleware[0](ctx, async () => {
      await app.middleware[1](ctx, async () => {})
    })

    assert.strictEqual(ctx.type, 'text/html')
  })
})
