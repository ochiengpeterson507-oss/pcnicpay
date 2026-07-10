import { useAuth } from '../../components/AuthProvider';
import { useSupabase } from '../../components/SupabaseProvider';
import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

import { Search, Download, Filter, Plus, Edit, Trash2 } from 'lucide-react';

export default function Contributions() {
  const { token } = useAuth();
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [statusFilter, setStatusFilter] = useState('');
  const [methodFilter, setMethodFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPayment, setEditingPayment] = useState<any>(null);
  const [newPayment, setNewPayment] = useState({ userId: '', amount: '', reference: '', date: new Date().toISOString().split('T')[0], status: 'COMPLETED' });
  const [members, setMembers] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/users', { headers: { 'Authorization': `Bearer ${token}` } })
      .then(res => res.ok ? res.json() : [])
      .then(setMembers)
      .catch(console.error);
  }, []);

  
  const supabase = useSupabase();

  useEffect(() => {
    fetchPayments();
    
    if (supabase) {
      const channel = supabase.channel('contributions-updates')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'Payment' }, payload => {
          fetchPayments();
        })
        .subscribe();
      return () => { supabase.removeChannel(channel); };
    }
  }, [supabase]);
  

  async function fetchPayments() {
    try {
      const res = await fetch('/api/payments', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setPayments(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filteredPayments = payments.filter(p => 
    p.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.reference?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  
  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/payments/manual', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
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
      const res = await fetch(`/api/payments/${editingPayment.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
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
      const res = await fetch(`/api/payments/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setPayments(payments.filter(p => p.id !== id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Paystack Transactions", 14, 15);
    const tableData = filteredPayments.map(p => [
      p.user?.name || 'Unknown',
      `KES ${p.amount}`,
      p.reference || '-',
      p.phoneNumber || '-',
      p.status || '-',
      new Date(p.date || p.createdAt).toLocaleDateString()
    ]);
    (doc as any).autoTable({
      head: [['Member', 'Amount', 'Reference', 'Method', 'Status', 'Date']],
      body: tableData,
      startY: 20,
    });
    doc.save('transactions.pdf');
  };

  const exportCSV = () => {
    const headers = ['Member Name', 'Phone', 'Amount (KES)', 'Reference', 'Date', 'Status'];
    const rows = filteredPayments.map(p => [
      p.user?.name || 'Unknown',
      p.phoneNumber || 'N/A',
      p.amount,
      p.reference,
      new Date(p.date).toLocaleString(),
      p.status
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'contributions.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Contributions</h1>
          <p className="text-sm text-slate-500">Track and manage all member payments</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by name or ref..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm w-full focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
                    <button 
            onClick={() => setShowAddModal(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2"
          >
            <Plus size={16} /> Add
          </button>
          <button 
            onClick={exportCSV}
            className="bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2"
          >
            <Download size={16} /> Export
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase font-bold text-slate-500">
              <tr>
                <th className="px-6 py-4">Member</th>
                <th className="px-6 py-4">Reference</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Method</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date & Time</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={5} className="text-center py-8">Loading contributions...</td></tr>
              ) : filteredPayments.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-8">No contributions found.</td></tr>
              ) : (
                filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                        {payment.user?.name?.charAt(0)}
                      </div>
                      <div>
                        <div>{payment.user?.name || 'Unknown'}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{payment.phoneNumber || 'M-Pesa Number'}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs">{payment.reference}</td>
                    <td className="px-6 py-4 text-xs font-medium text-slate-500 uppercase">{payment.phoneNumber || "MANUAL"}</td>
                    <td className="px-6 py-4 font-bold text-emerald-600">KES {payment.amount.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-xs font-bold">
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs">
                      <div>{new Date(payment.date).toLocaleDateString()}</div>
                      <div className="text-[10px] text-slate-400">{new Date(payment.date).toLocaleTimeString()}</div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => setEditingPayment(payment)} className="p-1 text-slate-400 hover:text-blue-600"><Edit size={16} /></button>
                        <button onClick={() => handleDeletePayment(payment.id)} className="p-1 text-slate-400 hover:text-red-600"><Trash2 size={16} /></button>
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
    </div>
  );
}
