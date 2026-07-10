const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// The code starts with:
// export const app = express();
// async function startServer() {
//   const PORT = 3000;
//   
//   const httpServer = createHttpServer(app);

// Let's replace the export const app = express() and startServer

code = code.replace(
  "export const app = express();\nasync function startServer() {\n  const PORT = 3000;\n  \n  const httpServer = createHttpServer(app);\n  const io = new SocketIOServer(httpServer, {\n    cors: {\n      origin: '*',\n    }\n  });\n  app.use(cors());\n  app.use(express.json());",
  `export const app = express();\nexport async function setupApp() {\n  app.use(cors());\n  app.use(express.json());`
);

// We need to also keep SocketIOServer for standalone, but since Vercel doesn't support it, we can conditionally add it if running standalone.

// Find the bottom part:
code = code.replace(
  "  httpServer.listen(PORT, '0.0.0.0', () => {\n    console.log(`Server running on http://localhost:${PORT}`);\n  });\n}\n\nstartServer().catch(console.error);",
  `  return app;\n}\n\nif (process.env.NODE_ENV !== 'production' || process.env.IS_STANDALONE) {\n  setupApp().then(app => {\n    const httpServer = createHttpServer(app);\n    const io = new SocketIOServer(httpServer, { cors: { origin: '*' } });\n    // bind io to something if needed, but the original code had io.on('connection') at the top. Let's just listen.\n    httpServer.listen(3000, '0.0.0.0', () => {\n      console.log('Server running on http://localhost:3000');\n    });\n  }).catch(console.error);\n}`
);

fs.writeFileSync('server.ts', code);
console.log('Fixed server.ts');
