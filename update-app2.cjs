const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf8');

const imports = `
import Contributions from './pages/Admin/Contributions';
`;

app = app.replace("import Expenses from './pages/Admin/Expenses';", "import Expenses from './pages/Admin/Expenses';\n" + imports);
app = app.replace('<Route path="contributions" element={<div className="p-4">Contributions (Coming Soon)</div>} />', '<Route path="contributions" element={<Contributions />} />');

fs.writeFileSync('src/App.tsx', app);
console.log("Updated App.tsx again");
