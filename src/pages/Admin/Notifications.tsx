import { useAuth } from '../../components/AuthProvider';
import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Bell, Check } from 'lucide-react';
import { useSupabase } from '../../components/SupabaseProvider';

export default function Notifications() {
  const { token } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const supabase = useSupabase();

  useEffect(() => {
    fetchNotifications();
    
    if (supabase) {
      const channel = supabase.channel('notifications')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'Notification' }, payload => {
          setNotifications(prev => [payload.new, ...prev]);
        })
        .subscribe();
      return () => { supabase.removeChannel(channel); };
    }
  }, [supabase]);

  async function fetchNotifications() {
    try {
      const res = await fetch('/api/notifications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setNotifications(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col justify-between items-start">
        <h1 className="text-2xl font-bold text-slate-800">Notifications</h1>
        <p className="text-sm text-slate-500">Live updates and system alerts</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            <Bell size={48} className="mx-auto mb-4 opacity-20" />
            <p>You're all caught up!</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {notifications.map(n => (
              <motion.div 
                key={n.id} 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 flex items-start gap-4 transition-colors ${n.read ? 'bg-white' : 'bg-blue-50/50'}`}
              >
                <div className={`p-2 rounded-full ${n.read ? 'bg-slate-100 text-slate-400' : 'bg-blue-100 text-blue-600'}`}>
                  <Bell size={18} />
                </div>
                <div className="flex-1">
                  <h4 className={`text-sm ${n.read ? 'font-medium text-slate-700' : 'font-bold text-slate-900'}`}>{n.title}</h4>
                  <p className="text-sm text-slate-600 mt-0.5">{n.message}</p>
                  <p className="text-xs text-slate-400 mt-2">{new Date(n.createdAt).toLocaleString()}</p>
                </div>
                {!n.read && (
                  <button 
                    onClick={() => markAsRead(n.id)}
                    className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                    title="Mark as read"
                  >
                    <Check size={18} />
                  </button>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
