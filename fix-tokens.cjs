const fs = require('fs');

const files = [
  'src/pages/Admin/Overview.tsx',
  'src/pages/Admin/Contributions.tsx',
  'src/pages/Admin/Notifications.tsx',
  'src/pages/Admin/Expenses.tsx',
  'src/pages/Admin/Reports.tsx',
  'src/pages/Admin/Members.tsx',
  'src/components/PaystackPaymentModal.tsx'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  
  if (content.includes("localStorage.getItem('token')")) {
    if (!content.includes('useAuth')) {
      content = "import { useAuth } from '../../components/AuthProvider';\n" + content;
      if (file.includes('PaystackPaymentModal')) {
        content = content.replace("import { useAuth } from '../../components/AuthProvider';\n", "import { useAuth } from './AuthProvider';\n");
      }
    }

    if (file.includes('PaystackPaymentModal')) {
      content = content.replace(/export default function PaystackPaymentModal\((.*?)\)\s*\{/, (match, args) => {
        return `export default function PaystackPaymentModal(${args}) {\n  const { token } = useAuth();`;
      });
    } else {
      content = content.replace(/export default function ([A-Za-z0-9_]+)\([^)]*\)\s*\{/, (match) => {
        return match + "\n  const { token } = useAuth();";
      });
    }

    content = content.replace(/localStorage\.getItem\('token'\)/g, "token");
    fs.writeFileSync(file, content);
  }
}
