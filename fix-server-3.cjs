const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  'const app = express();\nasync function startServer() {\n  const PORT = 3000;',
  'export const app = express();\nasync function startServer() {\n  const PORT = 3000;'
);
fs.writeFileSync('server.ts', code);
console.log('Exported app safely');
