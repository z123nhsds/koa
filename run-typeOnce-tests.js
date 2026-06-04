const context = require('./test-helpers/context');
const Koa = require('./lib/application');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`PASS: ${name}`);
    passed++;
  } catch (e) {
    console.log(`FAIL: ${name} - ${e.message}`);
    failed++;
  }
}

function assertEqual(actual, expected, msg) {
  if (actual !== expected) {
    throw new Error(`${msg}: expected ${expected}, got ${actual}`);
  }
}

// Test 1: default value
test('default typeOnce is false', () => {
  const ctx = context();
  assertEqual(ctx.response.typeOnce, false, 'typeOnce default');
});

// Test 2: typeOnce prevents overwrite
test('typeOnce prevents overwrite when Content-Type exists', () => {
  const ctx = context();
  ctx.response.typeOnce = true;
  ctx.type = 'text/html';
  ctx.type = 'application/json';
  assertEqual(ctx.type, 'text/html', 'type should remain text/html');
});

// Test 3: typeOnce allows first set
test('typeOnce allows first set when no Content-Type', () => {
  const ctx = context();
  ctx.response.typeOnce = true;
  ctx.type = 'application/json';
  assertEqual(ctx.type, 'application/json', 'type should be application/json');
});

// Test 4: body auto-inference still works with typeOnce
test('body auto-inference works with typeOnce enabled', () => {
  const ctx = context();
  ctx.response.typeOnce = true;
  ctx.body = '<h1>Hello</h1>';
  assertEqual(ctx.type, 'text/html', 'body should infer text/html');
});

// Test 5: app-level config inheritance
test('app-level typeOnce config is inherited', () => {
  const app = new Koa();
  app.response.typeOnce = true;
  const ctx = context(undefined, undefined, app);
  assertEqual(ctx.response.typeOnce, true, 'should inherit app-level config');
});

// Test 6: disabled mode still overwrites
test('disabled mode (default) still overwrites', () => {
  const ctx = context();
  ctx.type = 'text/html';
  ctx.type = 'application/json';
  assertEqual(ctx.type, 'application/json', 'type should be overwritten');
});

// Test 7: remove then set with typeOnce
test('remove Content-Type then set new type with typeOnce', () => {
  const ctx = context();
  ctx.response.typeOnce = true;
  ctx.type = 'text/html';
  ctx.remove('Content-Type');
  ctx.type = 'application/json';
  assertEqual(ctx.type, 'application/json', 'should allow new type after remove');
});

// Test 8: manual header respected
test('manual Content-Type header is respected with typeOnce', () => {
  const ctx = context();
  ctx.response.typeOnce = true;
  ctx.set('Content-Type', 'text/xml');
  ctx.type = 'application/json';
  assertEqual(ctx.type, 'text/xml', 'manual header should be preserved');
});

// Test 9: body with pre-set type preserves type
test('body assignment preserves pre-set type with typeOnce', () => {
  const ctx = context();
  ctx.response.typeOnce = true;
  ctx.type = 'text/xml';
  ctx.body = '<root>data</root>';
  assertEqual(ctx.type, 'text/xml', 'pre-set type should be preserved');
});

// Test 10: body sets type when no prior type exists
test('body sets type when no prior type with typeOnce', () => {
  const ctx = context();
  ctx.response.typeOnce = true;
  ctx.body = { foo: 'bar' };
  assertEqual(ctx.type, 'application/json', 'body should set json type');
});

// Test 11: unknown extension with typeOnce
test('unknown extension does not set type with typeOnce', () => {
  const ctx = context();
  ctx.response.typeOnce = true;
  ctx.type = 'asdf';
  if (ctx.type !== '') {
    throw new Error(`expected empty type, got ${ctx.type}`);
  }
});

// Test 12: Buffer body with typeOnce
test('Buffer body sets bin type with typeOnce', () => {
  const ctx = context();
  ctx.response.typeOnce = true;
  ctx.body = Buffer.from('hello');
  assertEqual(ctx.type, 'application/octet-stream', 'buffer should set bin type');
});

// Test 13: null body removes Content-Type
test('null body removes Content-Type with typeOnce', () => {
  const ctx = context();
  ctx.response.typeOnce = true;
  ctx.type = 'text/html';
  ctx.body = null;
  if (ctx.type !== '') {
    throw new Error(`expected empty type after null body, got ${ctx.type}`);
  }
});

// Test 14: per-request override of app-level setting
test('per-request override of app-level typeOnce', () => {
  const app = new Koa();
  app.response.typeOnce = true;
  const ctx = context(undefined, undefined, app);
  ctx.response.typeOnce = false;
  ctx.type = 'text/html';
  ctx.type = 'application/json';
  assertEqual(ctx.type, 'application/json', 'should allow override');
});

console.log(`\nResults: ${passed} passed, ${failed} failed, ${passed + failed} total`);
process.exit(failed > 0 ? 1 : 0);
