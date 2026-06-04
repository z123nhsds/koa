'use strict'

// 模拟一个简单的 response 实现
function mockResponse() {
  const res = {
    _headers: {},
    setHeader(key, value) {
      key = key.toLowerCase()
      console.log(`  setHeader called: ${key} = ${JSON.stringify(value)}`)
      // 关键问题：如果旧值已存在，是覆盖还是追加？
      res._headers[key] = value
    },
    getHeader(key) {
      return res._headers[key.toLowerCase()]
    },
    hasHeader(key) {
      return key.toLowerCase() in res._headers
    },
    removeHeader(key) {
      delete res._headers[key.toLowerCase()]
    }
  }
  return res
}

// 模拟 getType (来自 mime-types)
function getType(type) {
  const map = {
    'html': 'text/html; charset=utf-8',
    'json': 'application/json; charset=utf-8',
    'text/plain': 'text/plain; charset=utf-8'
  }
  if (type in map) return map[type]
  if (type.includes('/')) return type
  return null
}

// 模拟 response type setter
const response = {
  res: mockResponse(),
  get type() {
    const type = this.get('Content-Type')
    if (!type) return ''
    return type.split(';', 1)[0]
  },
  set type(type) {
    console.log(`Setting type to: ${type}`)
    type = getType(type)
    console.log(`After getType: ${type}`)
    if (type) {
      this.set('Content-Type', type)
    } else {
      this.remove('Content-Type')
    }
  },
  set(field, val) {
    if (typeof field === 'string') {
      this.res.setHeader(field, val)
    }
  },
  get(field) {
    return this.res.getHeader(field)
  },
  remove(field) {
    this.res.removeHeader(field)
  },
  has(field) {
    return this.res.hasHeader(field)
  }
}

console.log('=== 测试开始 ===')
console.log()
console.log('1. 设置 type = "html"')
response.type = 'html'
console.log('   Current type:', response.type)
console.log('   Headers:', response.res._headers)
console.log()
console.log('2. 再设置 type = "json"')
response.type = 'json'
console.log('   Current type:', response.type)
console.log('   Headers:', response.res._headers)
console.log()
console.log('=== 测试结束 ===')
