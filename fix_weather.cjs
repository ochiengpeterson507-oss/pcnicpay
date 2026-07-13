const fs = require('fs');
let code = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

code = code.replace(
  '<span className="block text-[10px] font-bold text-amber-600 mt-1">28°C</span>',
  '<span className="block text-[10px] font-bold text-amber-600 mt-1">28°C</span>\n                  </div>\n                </div>\n                <p className="text-[10px] text-amber-600 font-bold mt-4 relative z-10">☀️ Great day for outdoor fun!</p>'
);

fs.writeFileSync('src/pages/Dashboard.tsx', code);
