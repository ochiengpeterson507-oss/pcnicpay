const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  "const emitEvent = (event, data) => { /* socket.io disabled on vercel */ };",
  "let socketIoInstance = null;\nconst emitEvent = (event, data) => { if (socketIoInstance) socketIoInstance.emit(event, data); };"
);

// We still have `socketIoInstance = new SocketIOServer...` inside startServer. It will correctly reassign the outer `socketIoInstance`.
fs.writeFileSync('server.ts', code);
