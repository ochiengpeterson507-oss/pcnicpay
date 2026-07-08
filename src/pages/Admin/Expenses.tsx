import { useSupabase } from '../../components/SupabaseProvider';
import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Plus, Search, DollarSign, Receipt, Filter } from 'lucide-react';

export default function Expenses() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<any>(null);
  const [newExpense, setNewExpense] = useState({ title: '', amount: '', category: 'Food', date: new Date().toISOString().split('T')[0] });

  
  const supabase = useSupabase();

  useEffect(() => {
    fetchExpenses();
    
    if (supabase) {
      const channel = supabase.channel('expenses-updates')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'Expense' }, payload => {
          fetchExpenses();
        })
        .subscribe();
      return () => { supabase.removeChannel(channel); };
    }
  }, [supabase]);
  

  async function fetchExpenses() {
    try {
      const res = await fetch('/api/expenses', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) setExpenses(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify({
          ...newExpense,
          amount: parseFloat(newExpense.amount)
        })
      });
      if (res.ok) {
        setShowAddModal(false);
        fetchExpenses();
      }
    } catch (e) {
      console.error(e);
    }
  };

  
  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;
    try {
      const res = await fetch(`/api/expenses/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
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
      const res = await fetch(`/api/expenses/${editingExpense.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
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

  const categories = ['Food', 'Drinks', 'Transport', 'Venue', 'Entertainment', 'Photography', 'Emergency', 'Other'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Expenses</h1>
          <p className="text-sm text-slate-500">Manage and track group expenditures</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-sm transition-colors"
        >
          <Plus size={16} /> Record Expense
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-red-50 text-red-600 rounded-xl">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Expenses</p>
            <h3 className="text-xl font-black text-slate-800">
              KES {expenses.reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()}
            </h3>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Receipt size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Records</p>
            <h3 className="text-xl font-black text-slate-800">{expenses.length}</h3>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase font-bold text-slate-500">
              <tr>
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Recorded By</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={5} className="text-center py-8">Loading expenses...</td></tr>
              ) : expenses.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-8">No expenses recorded yet.</td></tr>
              ) : (
                expenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{expense.title}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-bold">
                        {expense.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-800">KES {expense.amount.toLocaleString()}</td>
                    <td className="px-6 py-4 text-xs">{new Date(expense.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-xs">{expense.user?.name || 'Admin'}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => setEditingExpense(expense)} className="p-1 text-slate-400 hover:text-blue-600">Edit</button>
                        <button onClick={() => handleDelete(expense.id)} className="p-1 text-slate-400 hover:text-red-600">Del</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
          >
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 text-lg">Record Expense</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={handleAddExpense} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Title</label>
                <input 
                  type="text" required value={newExpense.title} onChange={e => setNewExpense({...newExpense, title: e.target.value})}
                  className="w-full border border-slate-200 rounded-lg px-4 py-2" placeholder="e.g. Meat from Butchery"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Amount (KES)</label>
                <input 
                  type="number" required min="1" value={newExpense.amount} onChange={e => setNewExpense({...newExpense, amount: e.target.value})}
                  className="w-full border border-slate-200 rounded-lg px-4 py-2" placeholder="e.g. 5000"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Category</label>
                <select 
                  value={newExpense.category} onChange={e => setNewExpense({...newExpense, category: e.target.value})}
                  className="w-full border border-slate-200 rounded-lg px-4 py-2 bg-white"
                >
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Date</label>
                <input 
                  type="date" required value={newExpense.date} onChange={e => setNewExpense({...newExpense, date: e.target.value})}
                  className="w-full border border-slate-200 rounded-lg px-4 py-2"
                />
              </div>
              <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-lg mt-4">
                Save Expense
              </button>
            </form>
          </motion.div>
        </div>
      )}

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

    </div>
  );
}
