'use strict'

// 模拟 Node.js 的 http.ServerResponse
class MockResponse {
  constructor() {
    this._headers = {}
    this.headersSent = false
  }

  setHeader(name, value) {
    if (this.headersSent) return
    name = name.toLowerCase()
    
    console.log(`[MockResponse.setHeader] name: ${name}, value: ${value}, type: ${typeof value}`)
    
    if (name === 'content-type') {
      // 这里模拟 Node.js 的行为 - 当 value 是一个带分号的字符串时，会被 split 吗？
      // 或者问题出在其他地方？
    }
    
    this._headers[name] = value
  }

  getHeader(name) {
    return this._headers[name.toLowerCase()]
  }

  hasHeader(name) {
    return name.toLowerCase() in this._headers
  }

  removeHeader(name) {
    delete this._headers[name.toLowerCase()]
  }

  getHeaders() {
    return this._headers
  }
}

// 模拟 Koa 的 response 对象
const responsePrototype = {
  set type(type) {
    console.log(`[type setter] type: ${type}`)
    // 这里使用 getType (mime-types contentType)
    type = this.getType(type)
    console.log(`[type setter] after getType: ${type}`)
    if (type) {
      this.set('Content-Type', type)
    } else {
      this.remove('Content-Type')
    }
  },

  getType(type) {
    // 简单模拟 mime-types contentType 的行为
    // 假设它不会处理带多个分号的参数，或者有某种特殊处理
    if (type && type.includes(';')) {
      // 让我们测试一下带多个参数的情况
      console.log(`[getType] 处理带参数的类型: ${type}`)
      
      // 这里是关键！假设 mime-types 的 contentType 函数可能会
      // 将带多个参数的字符串返回为一个数组，或者导致某种问题
      
      // 或者问题是在于，当我们设置值时，Node.js 的 http 模块会如何处理？
      
      // 让我们先假设它只是原样返回
      return type
    }
    
    if (type === 'html' || type === '.html') return 'text/html; charset=utf-8'
    if (type === 'json' || type === '.json') return 'application/json; charset=utf-8'
    if (type === 'text/plain') return 'text/plain; charset=utf-8'
    return type
  },

  set(field, val) {
    if (this.headerSent || !field) return

    if (typeof field === 'string') {
      if (field.toLowerCase() === 'content-type') {
        console.log(`[set] content-type 检查 - val: ${val}, isArray: ${Array.isArray(val)}`)
        // 这里有断言！
        if (Array.isArray(val)) {
          console.error('错误: Assign multiple Content-Type for response header is not allowed')
        }
      }
      this.res.setHeader(field, val)
    } else {
      Object.keys(field).forEach(header => this.res.setHeader(header, field[header]))
    }
  },

  get(field) {
    return this.res.getHeader(field)
  },

  has(field) {
    return this.res.hasHeader(field)
  },

  remove(field) {
    if (this.headerSent) return
    this.res.removeHeader(field)
  },

  get header() {
    return this.res.getHeaders()
  }
}

// 创建测试对象
function createContext() {
  const res = new MockResponse()
  const ctx = Object.create(responsePrototype)
  ctx.res = res
  ctx.headerSent = false
  return ctx
}

// 测试场景 1: 正常的带一个参数的类型
console.log('=== 测试场景 1: text/html; charset=utf-8 ===')
const ctx1 = createContext()
ctx1.type = 'text/html; charset=utf-8'
console.log('结果:', ctx1.header)

console.log('\n=== 测试场景 2: 带多个参数的类型 ===')
const ctx2 = createContext()
ctx2.type = 'text/html; charset=utf-8; foo=bar'
console.log('结果:', ctx2.header)

console.log('\n=== 测试场景 3: 探索问题 ===')
// 让我们思考一下 - 问题可能出在 mime-types 库的 contentType 函数
// 当传入带多个参数的字符串时，它会不会返回数组？

// 让我们查看一下 mime-types 的文档或源码（我们可以基于已有的知识）
// mime-types 的 contentType 函数实际上来自 mime-types 库，它会：
// 1. 检查是否是扩展名，是则查找对应的 mime 类型
// 2. 如果已经是 mime 类型，它会检查是否需要添加 charset
// 3. 但是！如果传入的类型已经包含分号，它会如何处理？

// 让我们查看 content-type 库的 parse 函数，它可能被某些部分使用
