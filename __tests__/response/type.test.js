'use strict'

const { describe, it } = require('node:test')
const context = require('../../test-helpers/context')
const Koa = require('../../lib/application')
const assert = require('node:assert/strict')

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

  describe('with response.typeOnce enabled', () => {
    it('should not overwrite existing Content-Type', () => {
      const app = new Koa({ response: { typeOnce: true } })
      const ctx = context(null, null, app)
      ctx.type = 'application/json'
      ctx.type = 'text/plain' // 这个应该不会覆盖
      assert.strictEqual(ctx.type, 'application/json')
      assert.strictEqual(ctx.response.header['content-type'], 'application/json; charset=utf-8')
    })

    it('should set Content-Type when it is not set initially', () => {
      const app = new Koa({ response: { typeOnce: true } })
      const ctx = context(null, null, app)
      ctx.type = 'text/plain'
      assert.strictEqual(ctx.type, 'text/plain')
      assert.strictEqual(ctx.response.header['content-type'], 'text/plain; charset=utf-8')
    })

    it('should allow removing Content-Type even when typeOnce is enabled', () => {
      const app = new Koa({ response: { typeOnce: true } })
      const ctx = context(null, null, app)
      ctx.type = 'application/json'
      ctx.type = '' // 空字符串应该会移除 Content-Type
      assert(!ctx.type)
      assert(!ctx.response.header['content-type'])
    })

    it('should maintain default behavior when typeOnce is false', () => {
      const app = new Koa({ response: { typeOnce: false } })
      const ctx = context(null, null, app)
      ctx.type = 'application/json'
      ctx.type = 'text/plain'
      assert.strictEqual(ctx.type, 'text/plain')
      assert.strictEqual(ctx.response.header['content-type'], 'text/plain; charset=utf-8')
    })

    it('should maintain default behavior when typeOnce is not set', () => {
      const app = new Koa()
      const ctx = context(null, null, app)
      ctx.type = 'application/json'
      ctx.type = 'text/plain'
      assert.strictEqual(ctx.type, 'text/plain')
      assert.strictEqual(ctx.response.header['content-type'], 'text/plain; charset=utf-8')
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
