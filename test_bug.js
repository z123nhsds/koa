const Koa = require('./lib/application');
const response = require('./lib/response');

const res = Object.create(response);
res.res = {
  getHeader: () => ['text/html', 'text/plain']
};

try {
  console.log(res.type);
} catch (e) {
  console.log('Error:', e.message);
}
