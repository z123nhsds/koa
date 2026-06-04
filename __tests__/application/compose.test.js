'use strict'

const { describe, it } = require('node:test')
const request = require('supertest')
const assert = require('node:assert/strict')
const Koa = require('../..')

describe('app.compose', () => {
  it('should compose middleware', async () => {
    const app = new Koa()
    const calls = []

    app.use((ctx, next) => {
      calls.push(1)
      return next().then(() => {
        calls.push(2)
      })
    })

    app.use((ctx, next) => {
      calls.push(3)
      return next().then(() => {
        calls.push(4)
      })
    })

    await request(app.callback())
      .get('/')
      .expect(404)

    assert.deepStrictEqual(calls, [1, 3, 4, 2])
  })

  it('should work with configurable compose', async () => {
    const calls = []
    let count = 0
    const app = new Koa({
      compose (fns) {
        return (ctx) => {
          const dispatch = () => {
            count++
            const fn = fns.shift()
            return fn && fn(ctx, dispatch)
          }
          return dispatch()
        }
      }
    })

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

    assert.deepStrictEqual(calls, [1, 2, 3, 4])
    assert.equal(count, 3)
  })
})
