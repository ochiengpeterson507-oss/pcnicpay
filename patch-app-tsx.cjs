const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Add import
if (!code.includes("import Posters from './pages/Admin/Posters';")) {
  code = code.replace(
    "import Reports from './pages/Admin/Reports';",
    "import Reports from './pages/Admin/Reports';\nimport Posters from './pages/Admin/Posters';"
  );
}

// Add route
code = code.replace(
  '<Route path="announcements" element={<div className="p-4">Announcements (Coming Soon)</div>} />',
  '<Route path="announcements" element={<div className="p-4">Announcements (Coming Soon)</div>} />\n          <Route path="posters" element={<Posters />} />'
);

fs.writeFileSync('src/App.tsx', code);
