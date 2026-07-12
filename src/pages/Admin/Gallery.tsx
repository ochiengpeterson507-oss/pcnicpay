import React, { useState, useEffect } from 'react';
import { useSupabase } from '../../components/SupabaseProvider';
import { useAuth } from '../../components/AuthProvider';
import { Plus, Trash2, Image as ImageIcon } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Gallery() {
  const supabase = useSupabase();
  const { user } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchItems();
  }, [supabase]);

  async function fetchItems() {
    if (!supabase) return;
    try {
      const { data, error } = await supabase
        .from('Gallery')
        .select(`*, uploader:User(name)`)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setItems(data || []);
    } catch (e: any) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !user) return;
    if (!file) {
      setError('Please select an image to upload.');
      return;
    }
    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: formData
      });

      if (!uploadRes.ok) {
        const errorData = await uploadRes.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const { url } = await uploadRes.json();

      const { error } = await supabase.from('Gallery').insert({
        title,
        description,
        imageUrl: url,
        uploaded_by: user.id
      });
      
      if (error) throw error;
      
      setIsModalOpen(false);
      setTitle('');
      setDescription('');
      setFile(null);
      fetchItems();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setUploading(false);
    }
  };


  const handleDelete = async (id: string) => {
    if (!supabase || !confirm('Are you sure you want to delete this image?')) return;
    try {
      const { error } = await supabase.from('Gallery').delete().eq('id', id);
      if (error) throw error;
      setItems(items.filter(i => i.id !== id));
    } catch (e: any) {
      console.error(e);
    }
  };

  if (loading) return <div className="p-6">Loading gallery...</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Gallery</h1>
          <p className="text-slate-500 text-sm">Manage group photos and memories</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors font-medium text-sm shadow-sm"
        >
          <Plus size={16} />
          Add Image
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.length === 0 ? (
          <div className="col-span-full bg-white rounded-xl border border-slate-200 p-8 text-center">
            <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <ImageIcon size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-700 mb-1">No images yet</h3>
            <p className="text-slate-500 text-sm">Upload images to share with the group.</p>
          </div>
        ) : (
          items.map((item) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={item.id} 
              className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm flex flex-col"
            >
              <div className="h-48 overflow-hidden bg-slate-100">
                <img 
                  src={item.imageUrl} 
                  alt={item.title} 
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" 
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-md font-bold text-slate-800">{item.title}</h3>
                  <button 
                    onClick={() => handleDelete(item.id)}
                    className="text-slate-400 hover:text-red-600 p-1 rounded transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                {item.description && <p className="text-slate-600 text-xs mb-4 flex-1">{item.description}</p>}
                <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-2 mt-auto pt-4 border-t border-slate-50">
                  <span>{item.uploader?.name || 'Admin'}</span>
                  <span>•</span>
                  <span>{new Date(item.created_at).toLocaleDateString()}</span>
                </div>
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
              <h2 className="font-bold text-slate-800">Add New Image</h2>
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
                  placeholder="E.g., Group Retreat 2024"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Upload Image</label>
                <input
                  type="file"
                  accept="image/*"
                  required
                  onChange={e => setFile(e.target.files?.[0] || null)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Description (Optional)</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 h-24"
                  placeholder="A few words about this photo..."
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
                  Add Image
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
