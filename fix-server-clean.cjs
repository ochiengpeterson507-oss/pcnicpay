const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  `export const app = express();
export async function setupApp() {
  const io = new SocketIOServer(createHttpServer(app), { cors: { origin: '*' } });
  app.use(cors());
  app.use(express.json());
  
  const httpServer = createHttpServer(app);`,
  `export const app = express();
async function startServer() {
  const PORT = 3000;
  
  const httpServer = createHttpServer(app);`
);

fs.writeFileSync('server.ts', code);
console.log('Cleaned server.ts');
