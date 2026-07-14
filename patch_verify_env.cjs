const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');
code = code.replace(
  "const { reference } = req.body;",
  "const { reference } = req.body;\n      if (!process.env.PAYSTACK_SECRET_KEY) return res.status(400).json({ error: 'Paystack Secret Key is missing in server environment variables.' });"
);
fs.writeFileSync('server.ts', code);
