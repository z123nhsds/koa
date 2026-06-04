'use strict'

const { describe, it } = require('node:test')
const assert = require('node:assert/strict')
const context = require('../../test-helpers/context')

describe('ctx.append(name, val) - Content-Type protection', () => {
  it('should throw when appending to Content-Type header', () => {
    const ctx = context()
    ctx.set('Content-Type', 'text/html')
    
    assert.throws(
      () => ctx.append('Content-Type', 'text/plain'),
      /Assign multiple Content-Type for response header is not allowed/
    )
  })

  it('should throw when appending Content-Type to existing value', () => {
    const ctx = context()
    ctx.type = 'text/html'
    
    assert.throws(
      () => ctx.append('Content-Type', 'application/json'),
      /Assign multiple Content-Type for response header is not allowed/
    )
  })

  it('should allow append for other headers', () => {
    const ctx = context()
    ctx.append('X-Custom-Header', 'value1')
    ctx.append('X-Custom-Header', 'value2')
    
    assert.deepStrictEqual(
      ctx.response.header['x-custom-header'],
      ['value1', 'value2']
    )
  })
})
