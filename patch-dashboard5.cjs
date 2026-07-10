const fs = require('fs');
let code = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

const regexToRemove = /  const openPaymentModal = \(\) => \{\n    setPaymentAmount\(''\);\n    setPhoneNumber\(user\?\.phone \|\| '07'\);\n    setPaymentStatus\('idle'\);\n    setPaymentMessage\(''\);\n    setIsPaymentModalOpen\(true\);\n  \};/g;

code = code.replace(regexToRemove, `  const openPaymentModal = () => {
    setIsPaymentModalOpen(true);
  };`);
fs.writeFileSync('src/pages/Dashboard.tsx', code);
console.log('Fixed openPaymentModal');
