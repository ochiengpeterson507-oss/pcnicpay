const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  /amount: parseFloat\(amount\),\n\s*reference: `REF-\$\{Math.floor\(Math.random\(\) \* 1000000\)\}`,\n\s*userId,\n\s*status: 'COMPLETED'/g,
  `amount: parseFloat(amount),
        payment_reference: \`REF-\${Math.floor(Math.random() * 1000000)}\`,
        user_id: userId,
        payment_status: 'COMPLETED'`
);

fs.writeFileSync('server.ts', code);
