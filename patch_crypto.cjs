const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  "const hash = require('crypto').createHmac('sha512', secret).update(bodyString).digest('hex');",
  "const hash = crypto.createHmac('sha512', secret || '').update(bodyString).digest('hex');"
);

fs.writeFileSync('server.ts', code);
