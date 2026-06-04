'use strict'

const { describe, it } = require('node:test')
const assert = require('node:assert/strict')
const context = require('../../test-helpers/context')

describe('ctx.set(name, val)', () => {
  it('should set a field value', () => {
    const ctx = context()
    ctx.set('x-foo', 'bar')
    assert.strictEqual(ctx.response.get('x-foo'), 'bar')
  })

  it('should coerce number to string', () => {
    const ctx = context()
    ctx.set('x-foo', 5)
    assert.strictEqual(ctx.response.header['x-foo'], 5)
  })

  it('should coerce undefined to string', () => {
    const ctx = context()
    ctx.set('x-foo', undefined)
    assert.strictEqual(ctx.response.header['x-foo'], undefined)
  })

  it('should set a field value of array', () => {
    const ctx = context()
    ctx.set('x-foo', ['foo', 'bar', 123])
    assert.deepStrictEqual(ctx.response.header['x-foo'], ['foo', 'bar', 123])
  })

  describe('when field is Content-Type', () => {
    it('should set a single Content-Type value', () => {
      const ctx = context()
      ctx.set('Content-Type', 'text/plain; charset=utf-8')
      assert.strictEqual(ctx.response.get('Content-Type'), 'text/plain; charset=utf-8')
    })

    it('should reject array value for Content-Type', () => {
      const ctx = context()
      assert.throws(
        () => ctx.set('Content-Type', ['text/plain', 'text/html']),
        /Assign multiple Content-Type for response header is not allowed/
      )
    })

    it('should reject array value for content-type (case-insensitive)', () => {
      const ctx = context()
      assert.throws(
        () => ctx.set('content-type', ['application/json']),
        /Assign multiple Content-Type for response header is not allowed/
      )
    })

    it('should allow single string value for content-type (case-insensitive)', () => {
      const ctx = context()
      ctx.set('content-type', 'application/json')
      assert.strictEqual(ctx.response.get('content-type'), 'application/json')
    })
  })
})
