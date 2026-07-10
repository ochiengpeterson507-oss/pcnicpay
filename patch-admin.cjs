const fs = require('fs');

const file1 = 'src/pages/Admin/Contributions.tsx';
let code1 = fs.readFileSync(file1, 'utf8');
code1 = code1.replace(
  `fetch('/api/users', { headers: { 'Authorization': \`Bearer \${localStorage.getItem('token')}\` } })
      .then(res => res.json())`,
  `fetch('/api/users', { headers: { 'Authorization': \`Bearer \${localStorage.getItem('token')}\` } })
      .then(res => res.ok ? res.json() : [])`
);
fs.writeFileSync(file1, code1);

const file2 = 'src/pages/Admin/Reports.tsx';
let code2 = fs.readFileSync(file2, 'utf8');
code2 = code2.replace(
  `fetch('/api/payments', { headers: { 'Authorization': \`Bearer \${localStorage.getItem('token')}\` } })
      .then(res => res.json())`,
  `fetch('/api/payments', { headers: { 'Authorization': \`Bearer \${localStorage.getItem('token')}\` } })
      .then(res => res.ok ? res.json() : [])`
);
fs.writeFileSync(file2, code2);

console.log('Patched Admin fetches');
