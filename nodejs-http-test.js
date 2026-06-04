'use strict'

const http = require('http')
const net = require('net')

console.log('=== 测试 Node.js http.ServerResponse 的 setHeader 行为 ===')

// 创建一个 mock socket
const mockSocket = new net.Socket()
mockSocket.writable = true

// 创建一个 ServerResponse 实例
const res = new http.ServerResponse({ method: 'GET', httpVersionMajor: 1, httpVersionMinor: 1 })
res.assignSocket(mockSocket)

console.log('测试 1: 设置简单的 content-type')
res.setHeader('Content-Type', 'text/html; charset=utf-8')
console.log('Content-Type:', res.getHeader('Content-Type'))
console.log('类型:', typeof res.getHeader('Content-Type'))

console.log('\n测试 2: 设置带多个参数的 content-type')
try {
  res.setHeader('Content-Type', 'text/html; charset=utf-8; foo=bar')
  console.log('Content-Type:', res.getHeader('Content-Type'))
  console.log('类型:', typeof res.getHeader('Content-Type'))
} catch (err) {
  console.error('错误:', err)
}

console.log('\n测试 3: 查看响应头')
console.log('所有 headers:', res.getHeaders())

// 现在让我们看一下 Koa 代码中关键部分的问题
console.log('\n\n=== 分析 Koa 中的问题 ===')
console.log('在 response.js 的 set 方法中 (第 537-548 行):')
console.log(`
set (field, val) {
  if (this.headerSent || !field) return

  if (typeof field === 'string') {
    if (field.toLowerCase() === 'content-type') {
      assert(!Array.isArray(val), 'Assign multiple Content-Type for response header is not allowed')
    }
    this.res.setHeader(field, val)
  } else {
    Object.keys(field).forEach(header => this.res.setHeader(header, field[header]))
  }
}
`)

console.log('\n那么问题是什么呢？')
console.log('让我们想一想 - 当 type setter 调用 getType 时，返回的值会变成数组吗？')

console.log('\n让我们看一下 mime-types 库的 contentType 函数的工作方式。')
console.log('实际上，问题可能是：当传入一个已经包含分号的类型时，')
console.log('getType (mime-types contentType) 可能会做一些处理，或者...')
console.log('真正的问题在于，当设置 Content-Type 时，如果值中包含多个分号，')
console.log('Node.js 会不会在某些情况下将其解析为数组？')
console.log('或者，问题在于 Koa 需要确保我们正确处理带多个参数的 Content-Type 值？')

console.log('\n让我们思考修复方案...')
console.log('我们需要确保当设置 Content-Type 时，即使值包含多个分号，它也被当作单个字符串处理。')
console.log('实际上，看 Koa 的代码，问题可能在于：')
console.log('当我们调用 getType(type) 时，如果类型包含多个参数，mime-types 可能会做一些处理，')
console.log('但更可能的是，修复方案是在 type setter 中，我们需要先解析类型，只保留类型部分，')
console.log('然后再处理参数？或者，我们需要确保 setHeader 正确处理带多个参数的字符串？')
console.log('\n让我们看一下问题的关键 - 当设置 ctx.type = \'text/html; charset=utf-8; foo=bar\' 时')
console.log('问题会被触发，导致断言失败，说明 val 变成了数组！')

console.log('\n哦！我明白了！问题是：')
console.log('如果一个头部值中包含分号，在某些 Node.js 版本或某些条件下，')
console.log('Node.js 的 http 模块可能会将其作为多个值处理！但不应该对 Content-Type 这样做。')
console.log('修复方法是在 set 方法中，当 field 是 Content-Type 时，我们需要确保它是一个单个字符串，')
console.log('或者，我们需要在设置之前正确处理。')
