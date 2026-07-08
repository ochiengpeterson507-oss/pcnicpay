const fs = require('fs');
let code = fs.readFileSync('src/pages/Admin/Contributions.tsx', 'utf8');

const imports = "import { Search, Download, Filter, Plus, Edit, Trash2 } from 'lucide-react';";
code = code.replace("import { Search, Download, Filter } from 'lucide-react';", imports);

const states = `  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPayment, setEditingPayment] = useState<any>(null);
  const [newPayment, setNewPayment] = useState({ userId: '', amount: '', reference: '', date: new Date().toISOString().split('T')[0], status: 'COMPLETED' });
  const [members, setMembers] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/users', { headers: { 'Authorization': \`Bearer \${localStorage.getItem('token')}\` } })
      .then(res => res.json())
      .then(setMembers)
      .catch(console.error);
  }, []);`;
code = code.replace("const [searchTerm, setSearchTerm] = useState('');", "const [searchTerm, setSearchTerm] = useState('');\n" + states);

const functions = `
  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/payments/manual', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': \`Bearer \${localStorage.getItem('token')}\` 
        },
        body: JSON.stringify({ ...newPayment, amount: parseFloat(newPayment.amount) })
      });
      if (res.ok) {
        setShowAddModal(false);
        fetchPayments();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPayment) return;
    try {
      const res = await fetch(\`/api/payments/\${editingPayment.id}\`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': \`Bearer \${localStorage.getItem('token')}\` 
        },
        body: JSON.stringify({ ...editingPayment, amount: parseFloat(editingPayment.amount) })
      });
      if (res.ok) {
        setEditingPayment(null);
        fetchPayments();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeletePayment = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this payment record?')) return;
    try {
      const res = await fetch(\`/api/payments/\${id}\`, {
        method: 'DELETE',
        headers: { 'Authorization': \`Bearer \${localStorage.getItem('token')}\` }
      });
      if (res.ok) {
        setPayments(payments.filter(p => p.id !== id));
      }
    } catch (e) {
      console.error(e);
    }
  };
`;
code = code.replace("const exportCSV = () => {", functions + "\n  const exportCSV = () => {");

const addButton = `          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2"
          >
            <Plus size={16} /> Add
          </button>
          <button`;
code = code.replace("<button", addButton);

code = code.replace("<th className=\"px-6 py-4\">Date & Time</th>", "<th className=\"px-6 py-4\">Date & Time</th>\n                <th className=\"px-6 py-4 text-right\">Actions</th>");

const tds = `<td className="px-6 py-4 text-xs">
                      <div>{new Date(payment.date).toLocaleDateString()}</div>
                      <div className="text-[10px] text-slate-400">{new Date(payment.date).toLocaleTimeString()}</div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => setEditingPayment(payment)} className="p-1 text-slate-400 hover:text-blue-600"><Edit size={16} /></button>
                        <button onClick={() => handleDeletePayment(payment.id)} className="p-1 text-slate-400 hover:text-red-600"><Trash2 size={16} /></button>
                      </div>
                    </td>`;
code = code.replace(/<td className="px-6 py-4 text-xs">[\s\S]*?<\/td>/, tds);

const modals = `
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 text-lg">Add Manual Payment</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={handleAddPayment} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Member</label>
                <select required value={newPayment.userId} onChange={e => setNewPayment({...newPayment, userId: e.target.value})} className="w-full border border-slate-200 rounded-lg px-4 py-2 bg-white">
                  <option value="">Select a member</option>
                  {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Amount (KES)</label>
                <input type="number" required min="1" value={newPayment.amount} onChange={e => setNewPayment({...newPayment, amount: e.target.value})} className="w-full border border-slate-200 rounded-lg px-4 py-2" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Reference</label>
                <input type="text" required value={newPayment.reference} onChange={e => setNewPayment({...newPayment, reference: e.target.value})} className="w-full border border-slate-200 rounded-lg px-4 py-2" placeholder="e.g. CASH-123" />
              </div>
              <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-lg mt-4">Save Payment</button>
            </form>
          </motion.div>
        </div>
      )}

      {editingPayment && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 text-lg">Edit Payment</h3>
              <button onClick={() => setEditingPayment(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={handleUpdatePayment} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Amount (KES)</label>
                <input type="number" required min="1" value={editingPayment.amount} onChange={e => setEditingPayment({...editingPayment, amount: e.target.value})} className="w-full border border-slate-200 rounded-lg px-4 py-2" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Reference</label>
                <input type="text" required value={editingPayment.reference} onChange={e => setEditingPayment({...editingPayment, reference: e.target.value})} className="w-full border border-slate-200 rounded-lg px-4 py-2" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Status</label>
                <select required value={editingPayment.status} onChange={e => setEditingPayment({...editingPayment, status: e.target.value})} className="w-full border border-slate-200 rounded-lg px-4 py-2 bg-white">
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="PENDING">PENDING</option>
                  <option value="FAILED">FAILED</option>
                </select>
              </div>
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg mt-4">Update Payment</button>
            </form>
          </motion.div>
        </div>
      )}
`;

code = code.replace("    </div>\n  );\n}", modals + "    </div>\n  );\n}");

fs.writeFileSync('src/pages/Admin/Contributions.tsx', code);
console.log("Updated Contributions.tsx");
