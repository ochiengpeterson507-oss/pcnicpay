const fs = require('fs');
let code = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

code = code.replace(
  '<p className="text-[10px] text-amber-600 font-bold mt-4 relative z-10">☀️ Great day for outdoor fun!</p>\n                  </div>\n                </div>\n              </motion.div>',
  '<p className="text-[10px] text-amber-600 font-bold mt-4 relative z-10">☀️ Great day for outdoor fun!</p>\n              </motion.div>'
);

fs.writeFileSync('src/pages/Dashboard.tsx', code);
