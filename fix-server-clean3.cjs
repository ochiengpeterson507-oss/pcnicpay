const fs = require('fs');
const lines = fs.readFileSync('server.ts', 'utf8').split('\n');

let startIndex = -1;
let endIndex = -1;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('export const app = express();')) {
    startIndex = i;
  }
  if (startIndex !== -1 && lines[i].includes('const httpServer = createHttpServer(app);')) {
    endIndex = i;
    break;
  }
}

if (startIndex !== -1 && endIndex !== -1) {
  lines.splice(startIndex, endIndex - startIndex, 
    'export const app = express();',
    'async function startServer() {',
    '  const PORT = 3000;',
    '  '
  );
}

fs.writeFileSync('server.ts', lines.join('\n'));
console.log('Fixed lines');
