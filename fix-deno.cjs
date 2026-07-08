const fs = require('fs');
let code = fs.readFileSync('supabase/functions/paystack-webhook/index.ts', 'utf8');
code = '// @ts-nocheck\n' + code;
fs.writeFileSync('supabase/functions/paystack-webhook/index.ts', code);
