'use strict'

const { describe, it } = require('node:test')
const context = require('../../test-helpers/context')
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

  describe('with a vendor mime type containing +json', () => {
    it('should set the content type to json', () => {
      const ctx = context()
      ctx.type = 'application/vnd.myapi.v1+json'
      assert.strictEqual(ctx.type, 'application/vnd.myapi.v1+json')
    })
  })

  describe('when set multiple times', () => {
    it('should overwrite the Content-Type instead of appending', () => {
      const ctx = context()
      ctx.type = 'html'
      assert.strictEqual(ctx.type, 'text/html')
      assert.strictEqual(ctx.response.header['content-type'], 'text/html; charset=utf-8')
      ctx.type = 'json'
      assert.strictEqual(ctx.type, 'application/json')
      assert.strictEqual(ctx.response.header['content-type'], 'application/json; charset=utf-8')
    })

    it('should overwrite Content-Type across three assignments', () => {
      const ctx = context()
      ctx.type = 'html'
      ctx.type = 'text'
      ctx.type = 'json'
      assert.strictEqual(ctx.type, 'application/json')
      assert.strictEqual(ctx.response.header['content-type'], 'application/json; charset=utf-8')
    })
  })

  describe('when set multiple times with charset', () => {
    it('should overwrite Content-Type preserving the new charset', () => {
      const ctx = context()
      ctx.type = 'text/html; charset=iso-8859-1'
      assert.strictEqual(ctx.response.header['content-type'], 'text/html; charset=iso-8859-1')
      ctx.type = 'text/html; charset=utf-8'
      assert.strictEqual(ctx.response.header['content-type'], 'text/html; charset=utf-8')
    })

    it('should overwrite explicit charset with default charset when switching type', () => {
      const ctx = context()
      ctx.type = 'text/html; charset=iso-8859-1'
      assert.strictEqual(ctx.response.header['content-type'], 'text/html; charset=iso-8859-1')
      ctx.type = 'json'
      assert.strictEqual(ctx.response.header['content-type'], 'application/json; charset=utf-8')
    })
  })
})
