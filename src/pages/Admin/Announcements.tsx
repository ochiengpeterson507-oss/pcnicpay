import React, { useState, useEffect } from 'react';
import { useSupabase } from '../../components/SupabaseProvider';
import { useAuth } from '../../components/AuthProvider';
import { Plus, Trash2, Megaphone, Edit } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Announcements() {
  const supabase = useSupabase();
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnnouncements();
  }, [supabase]);

  async function fetchAnnouncements() {
    if (!supabase) return;
    try {
      const { data, error } = await supabase
        .from('Announcement')
        .select(`*, author:User(name)`)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setAnnouncements(data || []);
    } catch (e: any) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !user) return;
    
    try {
      const { error } = await supabase.from('Announcement').insert({
        title,
        content,
        created_by: user.id
      });
      
      if (error) throw error;
      
      setIsModalOpen(false);
      setTitle('');
      setContent('');
      fetchAnnouncements();
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!supabase || !confirm('Are you sure you want to delete this announcement?')) return;
    try {
      const { error } = await supabase.from('Announcement').delete().eq('id', id);
      if (error) throw error;
      setAnnouncements(announcements.filter(a => a.id !== id));
    } catch (e: any) {
      console.error(e);
    }
  };

  if (loading) return <div className="p-6">Loading announcements...</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Announcements</h1>
          <p className="text-slate-500 text-sm">Post real-time updates for all members</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors font-medium text-sm shadow-sm"
        >
          <Plus size={16} />
          New Announcement
        </button>
      </div>

      <div className="space-y-4">
        {announcements.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
            <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <Megaphone size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-700 mb-1">No announcements yet</h3>
            <p className="text-slate-500 text-sm">Create an announcement to broadcast to all members.</p>
          </div>
        ) : (
          announcements.map((announcement) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={announcement.id} 
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-bold text-slate-800">{announcement.title}</h3>
                <button 
                  onClick={() => handleDelete(announcement.id)}
                  className="text-slate-400 hover:text-red-600 p-1 rounded transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <p className="text-slate-600 text-sm mb-4 whitespace-pre-wrap">{announcement.content}</p>
              <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-2">
                <span>Posted by {announcement.author?.name || 'Admin'}</span>
                <span>•</span>
                <span>{new Date(announcement.created_at).toLocaleDateString()}</span>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="font-bold text-slate-800">New Announcement</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                &times;
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="E.g., Monthly Meeting Rescheduled"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Content</label>
                <textarea
                  required
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 h-32"
                  placeholder="Write your announcement here..."
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
                >
                  Post Announcement
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
