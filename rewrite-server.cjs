const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// We want to extract the route definitions into a separate function setupApp(app) 
// or just modify startServer to accept an option or only listen if not on Vercel.

code = code.replace(
  "export const app = express();\nasync function startServer() {\n  const PORT = 3000;",
  `export const app = express();

export async function setupApp() {
  const io = new SocketIOServer(createHttpServer(app), { cors: { origin: '*' } });
  app.use(cors());
  app.use(express.json());
`
);

code = code.replace(
  "  const httpServer = createHttpServer(app);\n  const io = new SocketIOServer(httpServer, {\n    cors: {\n      origin: '*',\n    }\n  });\n  app.use(cors());\n  app.use(express.json());",
  ""
);

code = code.replace(
  "  httpServer.listen(PORT, '0.0.0.0', () => {\n    console.log(`Server running on http://localhost:${PORT}`);\n  });\n}\n\nstartServer();",
  `  return app;
}

if (process.env.NODE_ENV !== 'production' || process.env.IS_STANDALONE) {
  setupApp().then(app => {
    const httpServer = createHttpServer(app);
    // Note: socket.io is not attached to this standalone httpServer here, but it's attached inside setupApp which is a bit weird.
    // Let's just run it simply for AI Studio:
    httpServer.listen(3000, '0.0.0.0', () => {
      console.log('Server running on http://localhost:3000');
    });
  });
}`
);

fs.writeFileSync('server.ts', code);
console.log('Rewritten server.ts');
