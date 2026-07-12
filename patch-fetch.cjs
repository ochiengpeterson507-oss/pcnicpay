const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// We have two fetch calls in server.ts: one for initialize, one for verify.
code = code.replace(
  "const response = await fetch('https://api.paystack.co/transaction/initialize', {",
  `const response = await fetch('https://api.paystack.co/transaction/initialize', {`
);

// Actually, I'll just rewrite the two routes.
