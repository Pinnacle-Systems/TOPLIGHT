const fs = require('fs');
const path = require('path');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const deps = new Set([...Object.keys(pkg.dependencies || {}), ...Object.keys(pkg.devDependencies || {})]);

function getFiles(dir, files = []) {
  if (dir.includes('node_modules') || dir.includes('build') || dir.includes('android') || dir.includes('ios')) return files;
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const name = dir + '/' + file;
    if (fs.statSync(name).isDirectory()) {
      getFiles(name, files);
    } else if (name.match(/\.(js|jsx|ts|tsx)$/)) {
      files.push(name);
    }
  }
  return files;
}

const files = getFiles('.');
const imports = new Set();
for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  const regex = /(?:import|require)\s*\(\s*['"]([^'"]+)['"]\s*\)|from\s+['"]([^'"]+)['"]/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    const imp = match[1] || match[2];
    if (imp && !imp.startsWith('.') && !imp.startsWith('/') && !imp.startsWith('src/') && !imp.startsWith('~')) {
      const parts = imp.split('/');
      const pkgName = imp.startsWith('@') ? parts[0] + '/' + parts[1] : parts[0];
      imports.add(pkgName);
    }
  }
}
const builtin = new Set(['path', 'fs', 'crypto', 'events', 'os', 'stream', 'util']);
const missing = [...imports].filter(imp => !deps.has(imp) && !imp.startsWith('react-native/') && imp !== 'react' && imp !== 'react-native' && !builtin.has(imp));
console.log(JSON.stringify(missing, null, 2));
