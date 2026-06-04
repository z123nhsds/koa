# Koa Content-Type Multiple Values Bug Analysis

## 1. Bug Reproduction

### Reproduction Code
File: `reproduce-bug.js`

```javascript
const Koa = require('./lib/application')
const http = require('http')

const app = new Koa()

app.use(async (ctx) => {
  // BUG: This creates multiple Content-Type values
  ctx.set('Content-Type', 'text/html')
  ctx.append('Content-Type', 'text/plain')
  
  ctx.body = 'Hello World'
})

const server = http.createServer(app.callback())
server.listen(3000)
```

### What Happens
1. `ctx.set('Content-Type', 'text/html')` - Sets Content-Type to 'text/html'
2. `ctx.append('Content-Type', 'text/plain')` - **BUG**: Attempts to append another value
3. This would result in `Content-Type: ['text/html', 'text/plain']` which violates HTTP spec

## 2. Bug Location

### Core File to Fix
**File:** `lib/response.js`

### Root Cause
The `append` method (line 566-579) does NOT check if the header being appended is `Content-Type`. 

**Before Fix (line 566-579):**
```javascript
append (field, val) {
  const prev = this.get(field)
  
  if (prev) {
    val = Array.isArray(prev)
      ? prev.concat(val)
      : [prev].concat(val)
  }
  
  return this.set(field, val)
}
```

The `set` method (line 540-550) DOES have protection for Content-Type:
```javascript
set (field, val) {
  if (typeof field === 'string') {
    if (field.toLowerCase() === 'content-type') {
      assert(!Array.isArray(val), 'Assign multiple Content-Type for response header is not allowed')
    }
    this.res.setHeader(field, val)
  }
}
```

**Problem:** The `append` method creates an array and passes it to `set`, but the assertion in `set` only catches direct array assignments, not the array created by `append`.

## 3. Test Commands

Based on README.md "Running tests" section:

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
node --test __tests__/response/content-type-append.test.js

# Run with linting
npm run lint
```

## 4. Fix Applied

### Modified File: `lib/response.js`

Added Content-Type protection at the beginning of the `append` method:

```javascript
append (field, val) {
  // NEW: Check if trying to append to Content-Type
  if (field.toLowerCase() === 'content-type') {
    assert(!this.has('Content-Type'), 'Assign multiple Content-Type for response header is not allowed')
  }

  const prev = this.get(field)

  if (prev) {
    val = Array.isArray(prev)
      ? prev.concat(val)
      : [prev].concat(val)
  }

  return this.set(field, val)
}
```

### Test File Created: `__tests__/response/content-type-append.test.js`

Tests that verify:
1. Appending to Content-Type throws an error
2. Other headers can still be appended normally
3. Error message is clear and descriptive

## 5. How ctx.body Works (from README)

According to Koa's documentation:

1. When you set `ctx.body`, Koa automatically:
   - Detects the type of value (string, buffer, stream, object, etc.)
   - Sets appropriate Content-Type header if not already set
   - Sets Content-Length when possible

2. For strings:
   - If starts with `<`, sets `text/html`
   - Otherwise sets `text/plain`

3. For objects:
   - Sets `application/json`

4. For buffers/streams:
   - Sets `application/octet-stream`

**The bug occurs when:**
- User manually sets Content-Type with `ctx.set()`
- Then tries to append another Content-Type with `ctx.append()`
- Or when `ctx.body` auto-sets Content-Type after manual setting

## 6. Files Created/Modified

1. **Modified:** `lib/response.js` - Added Content-Type protection in `append()` method
2. **Created:** `__tests__/response/content-type-append.test.js` - Test cases for the fix
3. **Created:** `reproduce-bug.js` - Bug reproduction script
4. **Created:** `BUG_ANALYSIS.md` - This analysis document
