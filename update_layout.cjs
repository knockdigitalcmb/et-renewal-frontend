const fs = require('fs');

// 1. Update Header.jsx
let headerFile = fs.readFileSync('src/components/layout/Header.jsx', 'utf-8');

const newHeaderLayout = `<header className="bg-white dark:bg-gray-800 min-h-[72px] py-3 md:py-0 flex flex-wrap md:flex-nowrap items-center justify-between px-4 md:px-8 border-b border-gray-200 dark:border-gray-700 transition-colors duration-200 gap-y-3">
        {/* Left: Welcome Text */}
        <div className="flex items-center w-auto md:w-1/3 order-1">
          <HamburgerButton />
          <h2 className="text-xl font-bold text-gray-800 dark:text-white whitespace-nowrap">Welcome, {username}</h2>
        </div>
        
        {/* Center: Global Search */}
        <div className="w-full md:w-1/3 flex justify-center order-3 md:order-2">
          <GlobalSearch />
        </div>
        
        {/* Right: Profile */}
        <div className="flex items-center justify-end w-auto md:w-1/3 order-2 md:order-3">
          <div className="relative" ref={dropdownRef}>`;

headerFile = headerFile.replace(
  /<header className="[^"]+">\s*<div className="flex items-center">\s*<HamburgerButton \/>\s*<h2[^>]+>Welcome, \{username\}<\/h2>\s*<\/div>\s*<div className="flex items-center space-x-4 md:space-x-6 w-full justify-end pr-2 md:pr-4">\s*<GlobalSearch \/>\s*<div className="relative" ref=\{dropdownRef\}>/m,
  newHeaderLayout
);

fs.writeFileSync('src/components/layout/Header.jsx', headerFile);


// 2. Update GlobalSearch.jsx
let gsFile = fs.readFileSync('src/components/common/GlobalSearch.jsx', 'utf-8');

// Update outer div width
gsFile = gsFile.replace(
  `<div className="relative w-full max-w-[350px]" ref={dropdownRef}>`,
  `<div className="relative w-full md:max-w-[400px] lg:max-w-[500px]" ref={dropdownRef}>`
);

// Update input styling (rounded-xl for 12px, shadow-sm, focus:border-blue-500)
gsFile = gsFile.replace(
  `className="w-full bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 pl-10 pr-8 py-2 rounded-lg text-[13px] border-none focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all placeholder-gray-500 dark:placeholder-gray-400"`,
  `className="w-full bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 pl-10 pr-8 py-2 rounded-xl text-[13px] border border-transparent shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all placeholder-gray-500 dark:placeholder-gray-400"`
);

fs.writeFileSync('src/components/common/GlobalSearch.jsx', gsFile);

console.log('Successfully updated layouts');
