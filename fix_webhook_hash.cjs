const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');
code = code.replace(
  "const hash = require('crypto').createHmac('sha512', secret).update(JSON.stringify(req.body)).digest('hex');",
  "const bodyString = Buffer.isBuffer(req.body) ? req.body.toString('utf8') : JSON.stringify(req.body);\n      const hash = require('crypto').createHmac('sha512', secret).update(bodyString).digest('hex');\n      const event = Buffer.isBuffer(req.body) ? JSON.parse(bodyString) : req.body;"
);
code = code.replace(
  "const event = req.body;",
  "// event is parsed above"
);
fs.writeFileSync('server.ts', code);
