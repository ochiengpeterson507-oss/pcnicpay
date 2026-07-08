const fs = require('fs');
let code = fs.readFileSync('src/pages/Admin/Members.tsx', 'utf8');

const imports = "import { Search, MoreVertical, Shield, UserX, UserCheck, Trash2, Edit } from 'lucide-react';";
code = code.replace("import { Search, MoreVertical, Shield, UserX, UserCheck, Trash2 } from 'lucide-react';", imports);

const stateAndFunctions = `
  const [editingMember, setEditingMember] = useState<any>(null);

  const handleUpdateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;
    try {
      const res = await fetch(\`/api/users/\${editingMember.id}\`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': \`Bearer \${localStorage.getItem('token')}\` 
        },
        body: JSON.stringify(editingMember)
      });
      if (res.ok) {
        setEditingMember(null);
        fetchMembers();
      }
    } catch (e) {
      console.error(e);
    }
  };
`;

code = code.replace("  const updateRole = async (id: string, role: string) => {", stateAndFunctions + "\n  const updateRole = async (id: string, role: string) => {");

const editBtn = `                        <button onClick={() => setEditingMember(member)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded" title="Edit details">
                          <Edit size={16} />
                        </button>`;
code = code.replace("                      <div className=\"flex items-center justify-end gap-2\">", "                      <div className=\"flex items-center justify-end gap-2\">\n" + editBtn);

const editModal = `
      {editingMember && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 text-lg">Edit Member</h3>
              <button onClick={() => setEditingMember(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={handleUpdateMember} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Name</label>
                <input type="text" required value={editingMember.name} onChange={e => setEditingMember({...editingMember, name: e.target.value})} className="w-full border border-slate-200 rounded-lg px-4 py-2" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email</label>
                <input type="email" required value={editingMember.email} onChange={e => setEditingMember({...editingMember, email: e.target.value})} className="w-full border border-slate-200 rounded-lg px-4 py-2" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Phone</label>
                <input type="text" value={editingMember.phone || ''} onChange={e => setEditingMember({...editingMember, phone: e.target.value})} className="w-full border border-slate-200 rounded-lg px-4 py-2" />
              </div>
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg mt-4">Update Member</button>
            </form>
          </motion.div>
        </div>
      )}
`;

code = code.replace("    </div>\n  );\n}", editModal + "    </div>\n  );\n}");

fs.writeFileSync('src/pages/Admin/Members.tsx', code);
console.log("Updated Members.tsx");
