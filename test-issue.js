'use strict'

const contentType = require('mime-types').contentType
const parse = require('content-type').parse
const format = require('content-type').format

console.log('Testing mime-types contentType function:')
console.log('Input: text/html')
console.log('Output:', contentType('text/html'))
console.log()

console.log('Input: text/html; charset=utf-8')
console.log('Output:', contentType('text/html; charset=utf-8'))
console.log()

console.log('Input: text/html; charset=utf-8; foo=bar')
console.log('Output:', contentType('text/html; charset=utf-8; foo=bar'))
console.log()

console.log('Testing content-type parse/format functions:')
console.log('Parsing: text/html; charset=utf-8; foo=bar')
const parsed = parse('text/html; charset=utf-8; foo=bar')
console.log('Parsed result:', parsed)
console.log('Formatted back:', format(parsed))
