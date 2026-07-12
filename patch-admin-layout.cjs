const fs = require('fs');
let code = fs.readFileSync('src/pages/Admin/AdminLayout.tsx', 'utf8');

// I will insert it after "Notifications" or "Expenses"
const newLink = `
  { path: '/admin/posters', label: 'Posters & Banners', icon: Image },`;

code = code.replace(
  "import { LayoutDashboard, Users, CreditCard, Receipt, FileText, Bell, LogOut, Settings, Image as ImageIcon } from 'lucide-react';",
  "import { LayoutDashboard, Users, CreditCard, Receipt, FileText, Bell, LogOut, Settings, Image as ImageIcon, Image } from 'lucide-react';"
);

if (!code.includes("path: '/admin/posters'")) {
    code = code.replace(
      "  { path: '/admin/reports', label: 'Reports', icon: FileText },",
      "  { path: '/admin/posters', label: 'Posters & Banners', icon: Image },\n  { path: '/admin/reports', label: 'Reports', icon: FileText },"
    );
}

fs.writeFileSync('src/pages/Admin/AdminLayout.tsx', code);
