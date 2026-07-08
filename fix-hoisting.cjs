const fs = require('fs');

const files = [
  'src/pages/Dashboard.tsx',
  'src/pages/Admin/Contributions.tsx',
  'src/pages/Admin/Expenses.tsx',
  'src/pages/Admin/Members.tsx',
  'src/pages/Admin/Notifications.tsx',
  'src/pages/Admin/Overview.tsx',
  'src/pages/Admin/Reports.tsx'
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let code = fs.readFileSync(file, 'utf8');
    
    // Replace `const fetchXYZ = async () => {` with `async function fetchXYZ() {`
    code = code.replace(/const (fetch\w+) = async \(\) => \{/g, 'async function $1() {');
    
    // Replace `const fetchXYZ = () => {` with `function fetchXYZ() {`
    code = code.replace(/const (fetch\w+) = \(\) => \{/g, 'function $1() {');
    
    fs.writeFileSync(file, code);
  }
});

console.log("Hoisting fixes applied");
