const fs = require('fs');
let layout = fs.readFileSync('src/pages/Admin/AdminLayout.tsx', 'utf8');

layout = layout.replace(
  "{ icon: PieChart, label: 'Reports & Analytics', path: '/admin/reports' },",
  "{ icon: PieChart, label: 'Reports & Analytics', path: '/admin/reports' },\n  { icon: Bell, label: 'Notifications', path: '/admin/notifications' },"
);

fs.writeFileSync('src/pages/Admin/AdminLayout.tsx', layout);
console.log("Updated AdminLayout");
