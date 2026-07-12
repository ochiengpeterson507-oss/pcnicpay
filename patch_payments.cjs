const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Replace /payments GET
code = code.replace(
  /res\.json\(payments \|\| \[\]\);/,
  `res.json((payments || []).map(p => ({ ...p, reference: p.payment_reference, status: p.payment_status, userId: p.user_id })));`
);

// Replace /payments/manual POST
code = code.replace(
  /userId, amount, reference, date, status, phoneNumber: 'Manual'/g,
  `user_id: userId, amount, payment_reference: reference, date, payment_status: status, phoneNumber: 'Manual'`
);

// Replace /payments/:id PUT
code = code.replace(
  /\.update\(\{ amount, reference, date, status \}\)/g,
  `.update({ amount, payment_reference: reference, date, payment_status: status })`
);

// We should also map the returned object in manual insert
code = code.replace(
  /emitEvent\('new-payment', data\);\n      res\.json\(data\);/,
  `const mappedData = { ...data, reference: data.payment_reference, status: data.payment_status, userId: data.user_id };
      emitEvent('new-payment', mappedData);
      res.json(mappedData);`
);

// And map the returned object in PUT
code = code.replace(
  /emitEvent\('payment-updated', data\);\n      res\.json\(data\);/,
  `const mappedData = { ...data, reference: data.payment_reference, status: data.payment_status, userId: data.user_id };
      emitEvent('payment-updated', mappedData);
      res.json(mappedData);`
);

fs.writeFileSync('server.ts', code);
