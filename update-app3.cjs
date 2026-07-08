const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf8');

const imports = `
import Reports from './pages/Admin/Reports';
`;

app = app.replace("import Contributions from './pages/Admin/Contributions';", "import Contributions from './pages/Admin/Contributions';\n" + imports);
app = app.replace('<Route path="reports" element={<div className="p-4">Reports (Coming Soon)</div>} />', '<Route path="reports" element={<Reports />} />');

fs.writeFileSync('src/App.tsx', app);
console.log("Updated App.tsx with Reports");
