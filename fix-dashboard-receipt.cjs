const fs = require('fs');
let code = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

const importPdf = "import jsPDF from 'jspdf';\n";
if (!code.includes('jspdf')) {
  code = code.replace("import { motion } from 'framer-motion';", importPdf + "import { motion } from 'framer-motion';");
}

const receiptFunc = `
  const downloadReceipt = (payment: any) => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text("Payment Receipt", 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text(\`Date: \${new Date(payment.paid_at || payment.created_at).toLocaleString()}\`, 20, 40);
    doc.text(\`Receipt Number: \${payment.payment_reference}\`, 20, 50);
    doc.text(\`Member: \${payment.user?.name || user?.name}\`, 20, 60);
    
    doc.setFontSize(14);
    doc.text(\`Amount Paid: KES \${payment.amount.toLocaleString()}\`, 20, 80);
    
    doc.setFontSize(12);
    doc.text(\`Status: \${payment.payment_status || 'COMPLETED'}\`, 20, 90);
    doc.text(\`Payment Method: \${payment.payment_method || 'Online'}\`, 20, 100);
    
    doc.setFontSize(10);
    doc.text("Thank you for your contribution!", 105, 130, { align: 'center' });
    
    doc.save(\`receipt-\${payment.payment_reference}.pdf\`);
  };
`;
code = code.replace("const initiatePayment = (e: React.FormEvent) => {", receiptFunc + "\n  const initiatePayment = (e: React.FormEvent) => {");

// Add receipt download button to the table
const downloadBtn = `
                        <td className="p-3 text-center hidden sm:table-cell">
                          {payment.user_id === user?.id ? (
                            <button 
                              onClick={() => downloadReceipt(payment)}
                              className="text-[10px] bg-blue-50 text-blue-600 hover:bg-blue-100 px-2 py-1 rounded"
                            >
                              Download Receipt
                            </button>
                          ) : (
                            <span className="bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full text-[9px]">Verified</span>
                          )}
                        </td>
`;

code = code.replace(/<td className="p-3 text-center hidden sm:table-cell">\s*<span className="bg-emerald-100.*?<\/span>\s*<\/td>/, downloadBtn);

// Ensure the table header fits
code = code.replace('<th className="p-3 text-center hidden sm:table-cell">Status</th>', '<th className="p-3 text-center hidden sm:table-cell">Receipt / Status</th>');

fs.writeFileSync('src/pages/Dashboard.tsx', code);
console.log('Added receipt download');
