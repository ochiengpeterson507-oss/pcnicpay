const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// I see an orphaned "}  });" around line 614.
code = code.replace(/  \}\);\n    \}\n  \}\);\n\n  \/\/ Admin CRUD for Users/g, "  });\n\n  // Admin CRUD for Users");

fs.writeFileSync('server.ts', code);
