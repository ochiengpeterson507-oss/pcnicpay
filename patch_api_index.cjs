const fs = require('fs');
let code = fs.readFileSync('api/index.ts', 'utf8');

// Vercel node handles imports without extensions or with .js better
code = code.replace(/'\.\.\/server\.ts'/g, "'../server'");

fs.writeFileSync('api/index.ts', code);
let code2 = fs.readFileSync('api/[...slug].ts', 'utf8');
code2 = code2.replace(/'\.\.\/server\.ts'/g, "'../server'");
fs.writeFileSync('api/[...slug].ts', code2);
