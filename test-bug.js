'use strict'

// 模拟相关代码
const getType = function(type) {
  // 模拟 mime-types 的 contentType 函数
  // 实际 mime-types 的 contentType 函数会处理带参数的类型
  // 让我们看一下它可能的行为
  if (type && type.includes(';')) {
    // 如果包含参数，mime-types 可能会返回完整的字符串？
    // 或者它会只返回类型部分？
    // 让我们测试一下不同的场景
    return type
  }
  // 简单模拟
  if (type === 'html' || type === '.html') return 'text/html; charset=utf-8'
  if (type === 'json' || type === '.json') return 'application/json; charset=utf-8'
  if (type === 'text/plain') return 'text/plain; charset=utf-8'
  return type
}

console.log('测试 1: 简单类型')
console.log('getType("text/plain") =', getType('text/plain'))

console.log('\n测试 2: 带参数的类型')
console.log('getType("text/html; charset=utf-8") =', getType('text/html; charset=utf-8'))
console.log('getType("text/html; charset=utf-8; foo=bar") =', getType('text/html; charset=utf-8; foo=bar'))

console.log('\n测试 3: 扩展类型')
console.log('getType("html") =', getType('html'))
