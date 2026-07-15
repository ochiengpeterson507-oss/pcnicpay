const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Patch initialize
code = code.replace(
  "  apiRouter.post('/payments/paystack/initialize', authenticateToken, async (req: any, res: any) => {\n    try {\n      const { amount, currency = 'KES' } = req.body || {};",
  "  apiRouter.post('/payments/paystack/initialize', authenticateToken, async (req: any, res: any) => {\n    console.log('[Paystack Init] Starting payment initialization...');\n    try {\n      console.log('[Paystack Init] Request body:', req.body);\n      const { amount, currency = 'KES' } = req.body || {};"
);

fs.writeFileSync('server.ts', code);
