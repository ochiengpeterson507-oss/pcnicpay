const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(/const \{ ([^\}]+) \} = req\.body;/g, "const { $1 } = req.body || {};");

fs.writeFileSync('server.ts', code);
