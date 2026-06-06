const fs = require('fs');
const path = require('path');

console.log('Current working directory:', process.cwd());

try {
  console.log('Files in current directory:');
  fs.readdirSync('.').forEach(file => {
    console.log('  ', file);
  });
} catch (err) {
  console.error(err);
}

try {
  console.log('Files in root /:');
  fs.readdirSync('/').forEach(file => {
    console.log('  ', file);
  });
} catch (err) {
  console.error(err);
}
