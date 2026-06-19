const fs = require('fs');
let headerFile = fs.readFileSync('src/components/layout/Header.jsx', 'utf-8');
headerFile = headerFile.replace(/<\/header>/, '</div>\n      </header>');
fs.writeFileSync('src/components/layout/Header.jsx', headerFile);
console.log('Fixed header');
