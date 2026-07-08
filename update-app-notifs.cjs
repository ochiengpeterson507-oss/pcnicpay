const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf8');

const imports = `
import Notifications from './pages/Admin/Notifications';
`;

app = app.replace("import Reports from './pages/Admin/Reports';", "import Reports from './pages/Admin/Reports';\n" + imports);

// We need a route for notifications. Let's add it under /admin or /dashboard. 
// I'll add it under /admin/notifications, even if it's not explicitly in the sidebar, or I can update sidebar.
// Wait, the sidebar doesn't have "notifications" explicitly, it has "Announcements", "Events" etc.
// But we can add the route anyway.
app = app.replace('<Route path="reports" element={<Reports />} />', '<Route path="reports" element={<Reports />} />\n          <Route path="notifications" element={<Notifications />} />');

fs.writeFileSync('src/App.tsx', app);
console.log("Updated App.tsx with Notifications");
