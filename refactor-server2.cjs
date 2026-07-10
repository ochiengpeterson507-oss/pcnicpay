const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  `export const app = express();
async function startServer() {
  const PORT = 3000;
  
  const httpServer = createHttpServer(app);
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: '*',
    }
  });

  app.use(cors());
  app.use(express.json());

  // Socket.IO
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  const JWT_SECRET = process.env.JWT_SECRET || 'picnicpay_super_secret_key_change_me_in_production';`,
  `export const app = express();
app.use(cors());
app.use(express.json());

let socketIoInstance = null;
const emitEvent = (event, data) => {
  if (socketIoInstance) {
    socketIoInstance.emit(event, data);
  }
};

const JWT_SECRET = process.env.JWT_SECRET || 'picnicpay_super_secret_key_change_me_in_production';`
);

// We need to move the server startup to the bottom of the file, around line 540
// Currently the end of the file looks like:
/*
  app.use('/api', apiRouter);

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(\`Server running on http://localhost:\${PORT}\`);
  });
}

startServer().catch(console.error);
*/

code = code.replace(
  `  app.use('/api', apiRouter);

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(\`Server running on http://localhost:\${PORT}\`);
  });
}

startServer().catch(console.error);`,
  `  app.use('/api', apiRouter);

async function startServer() {
  const PORT = 3000;
  const httpServer = createHttpServer(app);
  
  socketIoInstance = new SocketIOServer(httpServer, {
    cors: {
      origin: '*',
    }
  });

  socketIoInstance.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(\`Server running on http://localhost:\${PORT}\`);
  });
}

if (process.env.NODE_ENV !== 'production' || process.env.IS_STANDALONE) {
  startServer().catch(console.error);
}`
);

code = code.replace(/io\.emit\(/g, 'emitEvent(');

fs.writeFileSync('server.ts', code);
console.log('Refactored server.ts');
