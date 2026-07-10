import { useAuth } from '../../components/AuthProvider';
import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Search, MoreVertical, Shield, UserX, UserCheck, Trash2, Edit } from 'lucide-react';

export default function Members() {
  const { token } = useAuth();
  const [members, setMembers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMembers();
  }, []);

  async function fetchMembers() {
    try {
      const res = await fetch('/api/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setMembers(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };


  const [editingMember, setEditingMember] = useState<any>(null);

  const handleUpdateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;
    try {
      const res = await fetch(`/api/users/${editingMember.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
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

  const updateRole = async (id: string, role: string) => {
    try {
      const res = await fetch(`/api/users/${id}/role`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ role })
      });
      if (res.ok) {
        setMembers(members.map(m => m.id === id ? { ...m, role } : m));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filteredMembers = members.filter(m => 
    m.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Member Management</h1>
          <p className="text-sm text-slate-500">Manage all registered picnic members</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full sm:w-64 shadow-sm"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase font-bold text-slate-500">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Joined</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={5} className="text-center py-8">Loading members...</td></tr>
              ) : filteredMembers.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-8">No members found.</td></tr>
              ) : (
                filteredMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600">
                        {member.name?.charAt(0)}
                      </div>
                      {member.name}
                    </td>
                    <td className="px-6 py-4">
                      <div>{member.email}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{member.phone || 'No phone'}</div>
                    </td>
                    <td className="px-6 py-4">
                      {member.role === 'ADMIN' && <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-bold">Admin</span>}
                      {member.role === 'MEMBER' && <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-xs font-bold">Active</span>}
                      {member.role === 'SUSPENDED' && <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded text-xs font-bold">Suspended</span>}
                      {member.role === 'DELETED' && <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-bold">Deleted</span>}
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs">
                      {new Date(member.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => setEditingMember(member)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded" title="Edit details">
                          <Edit size={16} />
                        </button>
                        {member.role !== 'ADMIN' && (
                          <button onClick={() => updateRole(member.id, 'ADMIN')} className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded" title="Make Admin">
                            <Shield size={16} />
                          </button>
                        )}
                        {member.role !== 'MEMBER' && member.role !== 'DELETED' && (
                          <button onClick={() => updateRole(member.id, 'MEMBER')} className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded" title="Reactivate">
                            <UserCheck size={16} />
                          </button>
                        )}
                        {member.role === 'MEMBER' && (
                          <button onClick={() => updateRole(member.id, 'SUSPENDED')} className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded" title="Suspend">
                            <UserX size={16} />
                          </button>
                        )}
                        {member.role !== 'DELETED' && member.role !== 'ADMIN' && (
                          <button onClick={() => updateRole(member.id, 'DELETED')} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded" title="Soft Delete">
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

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
    </div>
  );
}
