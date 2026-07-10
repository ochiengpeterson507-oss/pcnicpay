const fs = require('fs');
let code = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

const downloadReceiptCode = `  const downloadReceipt = (payment: any) => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text("Payment Receipt", 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text(\`Date: \${new Date(payment.date || payment.createdAt).toLocaleString()}\`, 20, 40);
    doc.text(\`Receipt Number: \${payment.reference}\`, 20, 50);
    doc.text(\`Member: \${payment.user?.name || user?.name}\`, 20, 60);
    
    doc.setFontSize(14);
    doc.text(\`Amount Paid: KES \${payment.amount.toLocaleString()}\`, 20, 80);
    
    doc.setFontSize(12);
    doc.text(\`Status: \${payment.status || 'COMPLETED'}\`, 20, 90);
    doc.text(\`Payment Method: \${payment.phoneNumber || 'Online'}\`, 20, 100);
    
    doc.setFontSize(10);
    doc.text("Thank you for your contribution!", 105, 130, { align: 'center' });
    
    doc.save(\`receipt-\${payment.reference}.pdf\`);
  };\n\n`;

code = code.replace(
  `  async function fetchStats() {`,
  downloadReceiptCode + `  async function fetchStats() {`
);

fs.writeFileSync('src/pages/Dashboard.tsx', code);
console.log('Restored downloadReceipt');
