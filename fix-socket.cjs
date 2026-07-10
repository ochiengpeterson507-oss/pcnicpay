const fs = require('fs');

// 1. Dashboard.tsx
let dashboard = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');
dashboard = dashboard.replace(/import \{ io \} from 'socket\.io-client';\n?/g, '');
dashboard = dashboard.replace(/const socket = io\(\);\n?/g, '');
dashboard = dashboard.replace(/socket\.on/g, '// socket.on');
dashboard = dashboard.replace(/socket\.off/g, '// socket.off');
fs.writeFileSync('src/pages/Dashboard.tsx', dashboard);

// 2. server.ts
let server = fs.readFileSync('server.ts', 'utf8');
server = server.replace(/import \{ Server as SocketIOServer \} from 'socket\.io';\n?/g, '');
server = server.replace(/let socketIoInstance = null;\nconst emitEvent = \(event, data\) => \{\n  if \(socketIoInstance\) \{\n    socketIoInstance\.emit\(event, data\);\n  \}\n\};/g, 'const emitEvent = (event, data) => { /* socket.io disabled on vercel */ };');
server = server.replace(/socketIoInstance = new SocketIOServer\(httpServer, \{\n    cors: \{\n      origin: '\*',    \}\n  \}\);\n\n  socketIoInstance\.on\('connection', \(socket\) => \{\n    console\.log\('Client connected:', socket\.id\);\n    socket\.on\('disconnect', \(\) => \{\n      console\.log\('Client disconnected:', socket\.id\);\n    \}\);\n  \}\);/g, '');
fs.writeFileSync('server.ts', server);

console.log('Socket.io disabled');
