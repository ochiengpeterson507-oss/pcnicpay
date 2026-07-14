const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Patch initialize
code = code.replace(
  "const { amount, currency = 'KES' } = req.body;",
  "const { amount, currency = 'KES' } = req.body;\n      if (!amount || isNaN(amount)) return res.status(400).json({ error: 'Valid amount is required in req.body. Found: ' + JSON.stringify(req.body) });"
);

// Patch verify
code = code.replace(
  "const { reference } = req.body;",
  "const { reference } = req.body;\n      if (!reference) return res.status(400).json({ error: 'Transaction reference is required in req.body. Found: ' + JSON.stringify(req.body) });"
);

fs.writeFileSync('server.ts', code);
