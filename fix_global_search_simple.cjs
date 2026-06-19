const fs = require('fs');
let fileContent = fs.readFileSync('src/components/common/GlobalSearch.jsx', 'utf-8');

fileContent = fileContent.replaceAll('\\`', '`');
fileContent = fileContent.replaceAll('\\$', '$');

fs.writeFileSync('src/components/common/GlobalSearch.jsx', fileContent);
console.log('Fixed syntax errors simple');
