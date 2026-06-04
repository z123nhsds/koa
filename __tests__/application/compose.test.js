'use strict'

const { describe, it } = require('node:test')
const request = require('supertest')
const assert = require('node:assert/strict')
const Koa = require('../..')

function syncCompose (fns) {
  return function (ctx) {
    return dispatch(0)

    function dispatch (index) {
      const fn = fns[index]
      if (!fn) return
      return fn(ctx, function next () {
        return dispatch(index + 1)
      })
    }
  }
}

describe('app.compose', () => {
  it('should work with default compose ', async () => {
    const app = new Koa()
    const calls = []

    app.use((ctx, next) => {
      calls.push(1)
      return next().then(() => {
        calls.push(4)
      })
    })

    app.use((ctx, next) => {
      calls.push(2)
      return next().then(() => {
        calls.push(3)
      })
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

  it('should catch ctx.throw with synchronous compose', () => {
    const app = new Koa({ compose: syncCompose })

    app.use(ctx => {
      ctx.throw(418, 'boom')
    })

    return request(app.callback())
      .get('/')
      .expect(418, 'boom')
  })

  it('should catch ctx.assert with synchronous compose', () => {
    const app = new Koa({ compose: syncCompose })

    app.use(ctx => {
      ctx.assert(false, 401, 'missing user')
    })

    return request(app.callback())
      .get('/')
      .expect(401, 'missing user')
  })
})
