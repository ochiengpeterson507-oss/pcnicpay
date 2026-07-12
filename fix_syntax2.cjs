const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  /      res\.json\(data\);\n    \} catch \(err\) \{\n      res\.status\(500\)\.json\(\{ error: err\.message \}\);\n    \}\n  \}\);/g,
  ''
);

fs.writeFileSync('server.ts', code);
