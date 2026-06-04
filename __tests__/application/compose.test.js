'use strict'

const { describe, it } = require('node:test')
const request = require('supertest')
const assert = require('node:assert/strict')
const Koa = require('../..')

describe('Compose', () => {
  it('should support Promise-based middleware', async () => {
    const calls = []
    const app = new Koa()

    app.use((ctx, next) => {
      calls.push(1)
      return next().then(() => {
        calls.push(3)
      })
    })

    app.use((ctx, next) => {
      calls.push(2)
      return next()
    })

    app.use((ctx) => {
      calls.push(4)
    })

    await request(app.callback())
      .get('/')
      .expect(404)

    assert.deepStrictEqual(calls, [1, 2, 3, 4])
  })

  it('should work with configurable compose', async () => {
    const calls = []
    let count = 0
    const app = new Koa({
      compose (fns) {
        return async (ctx) => {
          const dispatch = async () => {
            count++
            const fn = fns.shift()
            fn && fn(ctx, dispatch)
          }
          dispatch()
        }
      }
    })

    app.use((ctx, next) => {
      calls.push(1)
      next()
      calls.push(4)
    })
    app.use((ctx, next) => {
      calls.push(2)
      next()
      calls.push(3)
    })

    await request(app.callback())
      .get('/')

    assert.deepStrictEqual(calls, [1, 2, 3, 4])
    assert.equal(count, 3)
  })
})
