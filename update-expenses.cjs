const fs = require('fs');
let code = fs.readFileSync('src/pages/Admin/Expenses.tsx', 'utf8');

// Add states for edit
code = code.replace("const [showAddModal, setShowAddModal] = useState(false);", "const [showAddModal, setShowAddModal] = useState(false);\n  const [editingExpense, setEditingExpense] = useState<any>(null);");

const editDeleteFunctions = `
  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;
    try {
      const res = await fetch(\`/api/expenses/\${id}\`, {
        method: 'DELETE',
        headers: { 'Authorization': \`Bearer \${localStorage.getItem('token')}\` }
      });
      if (res.ok) {
        setExpenses(expenses.filter(e => e.id !== id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExpense) return;
    try {
      const res = await fetch(\`/api/expenses/\${editingExpense.id}\`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': \`Bearer \${localStorage.getItem('token')}\` 
        },
        body: JSON.stringify({
          ...editingExpense,
          amount: parseFloat(editingExpense.amount)
        })
      });
      if (res.ok) {
        setEditingExpense(null);
        fetchExpenses();
      }
    } catch (e) {
      console.error(e);
    }
  };
`;

code = code.replace("const categories = ['Food', 'Drinks',", editDeleteFunctions + "\n  const categories = ['Food', 'Drinks',");

// Replace th
code = code.replace("<th className=\"px-6 py-4\">Recorded By</th>", "<th className=\"px-6 py-4\">Recorded By</th>\n                <th className=\"px-6 py-4 text-right\">Actions</th>");

// Replace td
code = code.replace("<td className=\"px-6 py-4 text-xs\">{expense.user?.name || 'Admin'}</td>", `<td className="px-6 py-4 text-xs">{expense.user?.name || 'Admin'}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => setEditingExpense(expense)} className="p-1 text-slate-400 hover:text-blue-600">Edit</button>
                        <button onClick={() => handleDelete(expense.id)} className="p-1 text-slate-400 hover:text-red-600">Del</button>
                      </div>
                    </td>`);

// Add Edit Modal
const editModal = `
      {editingExpense && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
          >
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 text-lg">Edit Expense</h3>
              <button onClick={() => setEditingExpense(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={handleUpdateExpense} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Title</label>
                <input 
                  type="text" required value={editingExpense.title} onChange={e => setEditingExpense({...editingExpense, title: e.target.value})}
                  className="w-full border border-slate-200 rounded-lg px-4 py-2"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Amount (KES)</label>
                <input 
                  type="number" required min="1" value={editingExpense.amount} onChange={e => setEditingExpense({...editingExpense, amount: e.target.value})}
                  className="w-full border border-slate-200 rounded-lg px-4 py-2"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Category</label>
                <select 
                  value={editingExpense.category} onChange={e => setEditingExpense({...editingExpense, category: e.target.value})}
                  className="w-full border border-slate-200 rounded-lg px-4 py-2 bg-white"
                >
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Date</label>
                <input 
                  type="date" required value={editingExpense.date?.split('T')[0]} onChange={e => setEditingExpense({...editingExpense, date: e.target.value})}
                  className="w-full border border-slate-200 rounded-lg px-4 py-2"
                />
              </div>
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg mt-4">
                Update Expense
              </button>
            </form>
          </motion.div>
        </div>
      )}
`;

code = code.replace("    </div>\n  );\n}", editModal + "\n    </div>\n  );\n}");

fs.writeFileSync('src/pages/Admin/Expenses.tsx', code);
console.log("Updated Expenses.tsx");
