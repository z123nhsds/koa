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
