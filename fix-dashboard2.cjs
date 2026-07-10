const fs = require('fs');
let code = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

const regex1 = /\/\/ socket\.on\('new-payment', \(payment\) => \{\n\s*setPayments\(\(prev\) => \[payment, \.\.\.prev\]\);\n\s*fetchStats\(\);\n\s*\}\);/g;
code = code.replace(regex1, '// socket.on disabled');

const regex2 = /\/\/ socket\.on\('payment-failed', \(data\) => \{\n\s*console\.log\('Payment failed:', data\);\n\s*\}\);/g;
code = code.replace(regex2, '');

fs.writeFileSync('src/pages/Dashboard.tsx', code);
