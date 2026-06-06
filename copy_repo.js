const fs = require('fs');
const path = require('path');

const srcDir = '/tmp/movie';
const destDir = '/app/applet';

// List of Android files to delete
const filesToDelete = [
  'app',
  'build.gradle.kts',
  'gradle',
  'gradle.properties',
  'local.properties',
  'settings.gradle.kts'
];

console.log('Cleaning up old files...');
filesToDelete.forEach(file => {
  const p = path.join(destDir, file);
  if (fs.existsSync(p)) {
    fs.rmSync(p, { recursive: true, force: true });
    console.log('Deleted:', p);
  }
});

function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach(childItemName => {
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

console.log('Copying new files from', srcDir, 'to', destDir);
fs.readdirSync(srcDir).forEach(item => {
  // We can skip copy_repo.js and tmp_list.js if they are in destiny, but they aren't in srcDir anyway.
  copyRecursiveSync(path.join(srcDir, item), path.join(destDir, item));
  console.log('Copied item:', item);
});

console.log('Copy complete!');
