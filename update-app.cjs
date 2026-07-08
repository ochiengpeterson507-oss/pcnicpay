const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf8');

const imports = `
import AdminOverview from './pages/Admin/Overview';
import Members from './pages/Admin/Members';
import Expenses from './pages/Admin/Expenses';
`;

app = app.replace("import AdminOverview from './pages/Admin/Overview';", imports);
app = app.replace('<Route path="members" element={<div className="p-4">Members Management (Coming Soon)</div>} />', '<Route path="members" element={<Members />} />');
app = app.replace('<Route path="expenses" element={<div className="p-4">Expenses (Coming Soon)</div>} />', '<Route path="expenses" element={<Expenses />} />');

fs.writeFileSync('src/App.tsx', app);
console.log("Updated App.tsx");
