const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(/res\.status\(500\)\.json\(\{ error: err\.message \}\);/g, "res.status(500).json({ error: err?.message || String(err) });");
code = code.replace(/res\.status\(500\)\.json\(\{ error: error\.message \|\| 'Server error' \}\);/g, "res.status(500).json({ error: error?.message || String(error) || 'Server error' });");

fs.writeFileSync('server.ts', code);
