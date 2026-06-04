'use strict'

const { describe, it } = require('node:test')
const assert = require('node:assert/strict')
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

  describe('when response.typeOnce is true', () => {
    it('should not overwrite an existing content-type', () => {
      const Koa = require('../../lib/application')
      const app = new Koa({ responseTypeOnce: true })
      const ctx = context(null, null, app)
      ctx.type = 'text/plain'
      assert.strictEqual(ctx.type, 'text/plain')
      assert.strictEqual(ctx.response.header['content-type'], 'text/plain; charset=utf-8')
      
      ctx.type = 'json'
      assert.strictEqual(ctx.type, 'text/plain')
      assert.strictEqual(ctx.response.header['content-type'], 'text/plain; charset=utf-8')
    })

    it('should allow overwriting content-type if unset first', () => {
      const Koa = require('../../lib/application')
      const app = new Koa({ responseTypeOnce: true })
      const ctx = context(null, null, app)
      ctx.type = 'text/plain'
      ctx.type = '' // Unset the type
      ctx.type = 'json'
      assert.strictEqual(ctx.type, 'application/json')
      assert.strictEqual(ctx.response.header['content-type'], 'application/json; charset=utf-8')
    })

    it('should not affect ctx.body stream auto-inference', () => {
      const Koa = require('../../lib/application')
      const app = new Koa({ responseTypeOnce: true })
      const ctx = context(null, null, app)
      const { Readable } = require('node:stream')
      
      ctx.type = 'text/plain'
      ctx.body = new Readable()
      
      // Since it already has a type, it shouldn't overwrite it to 'application/octet-stream' (bin)
      assert.strictEqual(ctx.type, 'text/plain')
    })
  })
})
