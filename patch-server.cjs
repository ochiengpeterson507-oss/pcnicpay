const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  'async function startServer() {\n  const app = express();',
  'export const app = express();\nasync function startServer() {'
);

fs.writeFileSync('server.ts', code);
console.log('Patched server.ts to export app');
