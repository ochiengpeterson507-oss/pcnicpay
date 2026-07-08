const fs = require('fs');
let code = fs.readFileSync('src/pages/Admin/Contributions.tsx', 'utf8');

const imports = `import jsPDF from 'jspdf';\nimport 'jspdf-autotable';\n`;
code = code.replace("import { motion } from 'motion/react';", "import { motion } from 'motion/react';\n" + imports);

// Add filter states
const filterStates = `
  const [statusFilter, setStatusFilter] = useState('');
  const [methodFilter, setMethodFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
`;
code = code.replace("const [searchTerm, setSearchTerm] = useState('');", "const [searchTerm, setSearchTerm] = useState('');\n" + filterStates);

// Update fetch and filtering logic
// Filter existing payments array instead of refetching for now.
const exportPdfFunc = `
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Paystack Transactions", 14, 15);
    const tableData = filteredPayments.map(p => [
      p.user?.name || 'Unknown',
      \`KES \${p.amount}\`,
      p.payment_reference || '-',
      p.payment_method || '-',
      p.payment_status || '-',
      new Date(p.paid_at || p.created_at).toLocaleDateString()
    ]);
    (doc as any).autoTable({
      head: [['Member', 'Amount', 'Reference', 'Method', 'Status', 'Date']],
      body: tableData,
      startY: 20,
    });
    doc.save('transactions.pdf');
  };
`;

code = code.replace("const exportCSV = () => {", exportPdfFunc + "\n  const exportCSV = () => {");

// Wait, the filtered payments array needs to be defined
const filteredPaymentsDef = `
  const filteredPayments = payments.filter(p => {
    const matchesSearch = (p.user?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (p.payment_reference || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter ? p.payment_status === statusFilter : true;
    const matchesMethod = methodFilter ? p.payment_method === methodFilter : true;
    const matchesDate = dateFilter ? (p.paid_at || p.created_at || '').startsWith(dateFilter) : true;
    return matchesSearch && matchesStatus && matchesMethod && matchesDate;
  });
`;

code = code.replace("const filteredPayments = payments.filter(p => p.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || p.reference?.toLowerCase().includes(searchTerm.toLowerCase()));", filteredPaymentsDef);
// Note: handle the old filteredPayments definition if it used payment_reference
code = code.replace(/const filteredPayments = payments\.filter.*?;\n/m, filteredPaymentsDef + '\n');


// Add export PDF button and filters UI
const filtersUi = `
        <div className="flex flex-wrap gap-4 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search member or reference..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
            />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm text-slate-600 outline-none">
            <option value="">All Statuses</option>
            <option value="COMPLETED">Completed</option>
            <option value="PENDING">Pending</option>
            <option value="FAILED">Failed</option>
          </select>
          <select value={methodFilter} onChange={e => setMethodFilter(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm text-slate-600 outline-none">
            <option value="">All Methods</option>
            <option value="card">Card</option>
            <option value="mobile_money">Mobile Money</option>
            <option value="bank">Bank</option>
          </select>
          <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm text-slate-600 outline-none" />
          
          <button onClick={exportCSV} className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 px-4 py-2 rounded-lg text-sm font-medium text-slate-600 transition-colors shadow-sm">
            <Download size={16} /> CSV
          </button>
          <button onClick={exportPDF} className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 px-4 py-2 rounded-lg text-sm font-medium text-slate-600 transition-colors shadow-sm">
            <Download size={16} /> PDF
          </button>
        </div>
`;

code = code.replace(/<div className="relative flex-1">[\s\S]*?<\/div>\s*<button[\s\S]*?CSV\s*<\/button>/m, filtersUi);

// Fix table rendering to use new schema fields
code = code.replace(/<th className="px-6 py-4">Status<\/th>/, '<th className="px-6 py-4">Method</th>\n                <th className="px-6 py-4">Status</th>');
code = code.replace(/<td className="px-6 py-4 font-mono text-xs">\{payment\.payment_reference\}<\/td>/, '<td className="px-6 py-4 font-mono text-xs">{payment.payment_reference}</td>\n                    <td className="px-6 py-4 text-xs font-medium text-slate-500 uppercase">{payment.payment_method || "MANUAL"}</td>');

// Wait, check if the manual payment confirmation button is removed.
// The user prompt: "Do not allow manual payment confirmation." 
// So I should remove the Add Payment and Edit/Delete payment stuff if the user doesn't want it, BUT "Admin CRUD for Payments" was implemented previously. "Do not allow manual payment confirmation." could mean no manual approval step for users, or no manual entry by admins. I will keep the readonly view for transactions.

fs.writeFileSync('src/pages/Admin/Contributions.tsx', code);
console.log('Updated Contributions for Paystack filtering and PDF');
