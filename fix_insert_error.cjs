const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');
code = code.replace(
  "        if (!existing) {\n          const { data: payment } = await getSupabase().from('Payment').insert({",
  "        if (!existing) {\n          const { data: payment, error: insertError } = await getSupabase().from('Payment').insert({"
);
fs.writeFileSync('server.ts', code);
