const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(/.order\('date'/g, ".order('paid_at'");
fs.writeFileSync('server.ts', code);
console.log('Fixed server schema order');
