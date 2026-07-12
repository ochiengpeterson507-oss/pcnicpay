const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  /      res\.json\(\(payments \|\| \[\]\)\.map\(p => \(\{ \.\.\.p, reference: p\.payment_reference, status: p\.payment_status, userId: p\.user_id \}\)\)\);\n    \} catch \(error: any\) \{\n      console\.error\(error\);\n      res\.status\(500\)\.json\(\{ error: error\.message \|\| 'Server error' \}\);\n    \}\n  \}\);/s,
  ''
);

fs.writeFileSync('server.ts', code);
