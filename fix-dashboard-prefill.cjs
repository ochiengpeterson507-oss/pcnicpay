const fs = require('fs');
let code = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

code = code.replace("const [phoneNumber, setPhoneNumber] = useState('');", "const [phoneNumber, setPhoneNumber] = useState(user?.phone || '');");

code = code.replace(/email: user\?\.email \|\| '',/g, "email: user?.email || '',\n      firstname: user?.name?.split(' ')[0] || '',\n      lastname: user?.name?.split(' ').slice(1).join(' ') || '',");

fs.writeFileSync('src/pages/Dashboard.tsx', code);
console.log('Fixed prefill');
