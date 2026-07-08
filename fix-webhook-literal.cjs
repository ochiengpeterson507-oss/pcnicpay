const fs = require('fs');
let code = fs.readFileSync('supabase/functions/paystack-webhook/index.ts', 'utf8');
code = code.replace(/\\`Your contribution of \\\$\{data\.currency \|\| 'KES'\} \\\$\{amount\} was received successfully\.\\`/g, "`Your contribution of ${data.currency || 'KES'} ${amount} was received successfully.`");
fs.writeFileSync('supabase/functions/paystack-webhook/index.ts', code);
