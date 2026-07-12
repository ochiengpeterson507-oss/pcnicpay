const fs = require('fs');
let code = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

// I will change `const fetchPosters = async () => {` to `async function fetchPosters() {`
code = code.replace(
  "const fetchPosters = async () => {",
  "async function fetchPosters() {"
);

code = code.replace(
  "const fetchStats = async () => {",
  "async function fetchStats() {"
);

code = code.replace(
  "const fetchPayments = async () => {",
  "async function fetchPayments() {"
);

fs.writeFileSync('src/pages/Dashboard.tsx', code);
