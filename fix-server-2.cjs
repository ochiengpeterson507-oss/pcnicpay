const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Undo the changes to server.ts
code = code.replace(
  `export const app = express();\nexport async function setupApp() {\n  app.use(cors());\n  app.use(express.json());`,
  `const app = express();\nasync function startServer() {\n  const PORT = 3000;\n  \n  const httpServer = createHttpServer(app);\n  const io = new SocketIOServer(httpServer, {\n    cors: {\n      origin: '*',\n    }\n  });\n  app.use(cors());\n  app.use(express.json());\n  io.on('connection', (socket) => {\n    console.log('Client connected:', socket.id);\n    socket.on('disconnect', () => {\n      console.log('Client disconnected:', socket.id);\n    });\n  });`
);

code = code.replace(
  `  return app;\n}\n\nif (process.env.NODE_ENV !== 'production' || process.env.IS_STANDALONE) {\n  setupApp().then(app => {\n    const httpServer = createHttpServer(app);\n    const io = new SocketIOServer(httpServer, { cors: { origin: '*' } });\n    // bind io to something if needed, but the original code had io.on('connection') at the top. Let's just listen.\n    httpServer.listen(3000, '0.0.0.0', () => {\n      console.log('Server running on http://localhost:3000');\n    });\n  }).catch(console.error);\n}`,
  `  httpServer.listen(PORT, '0.0.0.0', () => {\n    console.log(\`Server running on http://localhost:\${PORT}\`);\n  });\n}\n\nstartServer().catch(console.error);`
);

fs.writeFileSync('server.ts', code);
console.log('Restored server.ts');
