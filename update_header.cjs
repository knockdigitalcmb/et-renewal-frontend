const fs = require('fs');

let headerFile = fs.readFileSync('src/components/layout/Header.jsx', 'utf-8');

headerFile = headerFile.replace(
  `import { FiUser, FiSettings, FiLogOut } from 'react-icons/fi';`,
  `import { FiUser, FiSettings, FiLogOut } from 'react-icons/fi';\nimport GlobalSearch from '../common/GlobalSearch';`
);

headerFile = headerFile.replace(
  `<div className="relative" ref={dropdownRef}>`,
  `<div className="flex items-center space-x-4 md:space-x-6 w-full justify-end pr-2 md:pr-4">\n          <GlobalSearch />\n        <div className="relative" ref={dropdownRef}>`
);

headerFile = headerFile.replace(
  `          )}
        </div>
      </header>`,
  `          )}
        </div>
        </div>
      </header>`
);

fs.writeFileSync('src/components/layout/Header.jsx', headerFile);

console.log('Successfully updated Header.jsx with GlobalSearch');
