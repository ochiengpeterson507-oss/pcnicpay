const fs = require('fs');
let code = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

const regexToRemove = /  const config = \{[\s\S]*?const initiatePayment = async \(e: React\.FormEvent\) => \{[\s\S]*?  \};\n/g;

code = code.replace(regexToRemove, '');
fs.writeFileSync('src/pages/Dashboard.tsx', code);
console.log('Removed config and initiatePayment');
