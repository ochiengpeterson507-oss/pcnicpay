const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// We need to move the app setup outside of startServer().
// Replace the startServer() block top part:
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
  });`,
  `export const app = express();
app.use(cors());
app.use(express.json());

let io = null;
const emitEvent = (event, data) => {
  if (io) {
    io.emit(event, data);
  }
};

async function startServer() {
  const PORT = 3000;
  const httpServer = createHttpServer(app);
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: '*',
    }
  });

  // Socket.IO
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });`
);

// We need to replace io.emit inside the routes with emitEvent
code = code.replace(/io\.emit\(/g, 'emitEvent(');

// Also we need to move the route setup outside of startServer()
// But wait, the routes use JWT_SECRET and getSupabase() which are at the module level, so that's fine.
// The routes are currently inside startServer().
// To move them outside, we can just close startServer() earlier, and open it later?
// Or we just move `async function startServer() {` to be after all the routes!

// Wait, the routes are attached to `apiRouter`, and then `app.use('/api', apiRouter)`.
// We can just find `const JWT_SECRET = process.env.JWT_SECRET` and put `startServer()` AFTER the API routes setup.
fs.writeFileSync('server-test.ts', code);
