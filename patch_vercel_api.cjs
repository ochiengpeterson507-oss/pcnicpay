const fs = require('fs');

const indexCode = `
import { app } from '../server.js';
export const config = {
  api: {
    bodyParser: false,
  },
};
export default app;
`;

fs.writeFileSync('api/index.ts', indexCode);
fs.writeFileSync('api/[...slug].ts', indexCode);
console.log('Patched api/index.ts and api/[...slug].ts');
