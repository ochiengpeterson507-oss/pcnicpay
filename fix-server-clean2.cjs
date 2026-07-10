const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const regex = /export const app = express\(\);\nexport async function setupApp\(\) \{\n  const io = new SocketIOServer\(createHttpServer\(app\), \{ cors: \{ origin: '\*' \} \}\);\n  app\.use\(cors\(\)\);\n  app\.use\(express\.json\(\)\);\n  \n  const httpServer = createHttpServer\(app\);/g;

code = code.replace(regex, `export const app = express();\nasync function startServer() {\n  const PORT = 3000;\n  const httpServer = createHttpServer(app);`);

fs.writeFileSync('server.ts', code);
console.log('Cleaned server.ts 2');
