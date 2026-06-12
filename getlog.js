const { execSync } = require('child_process');
try {
  console.log(execSync('git log -n 5 --stat').toString());
} catch (e) {
  console.log(e);
}
