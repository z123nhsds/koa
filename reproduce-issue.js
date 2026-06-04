'use strict'

const context = require('./test-helpers/context')
const assert = require('node:assert/strict')

console.log('=== 复现问题 ===')

const ctx = context()

console.log('1. 第一次设置 ctx.type = "html"')
ctx.type = 'html'
console.log('Content-Type:', ctx.response.header['content-type'])

console.log('2. 第二次设置 ctx.type = "json"')
ctx.type = 'json'
console.log('Content-Type:', ctx.response.header['content-type'])

console.log('=== 测试完成 ===')
