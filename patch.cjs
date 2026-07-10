const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  "const { data: payment } = await getSupabase().from('Payment').insert({",
  "const { data: payment, error: insertError } = await getSupabase().from('Payment').insert({"
);

code = code.replace(
  "return res.json({ success: true, payment, insertError: error });",
  "if (insertError) { console.error('Insert error:', insertError); return res.status(500).json({ error: insertError }); }\n          return res.json({ success: true, payment });"
);

fs.writeFileSync('server.ts', code);
