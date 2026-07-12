const fs = require('fs');
let code = fs.readFileSync('src/pages/Admin/Gallery.tsx', 'utf8');

code = code.replace(
  "const [imageUrl, setImageUrl] = useState('');",
  "const [file, setFile] = useState<File | null>(null);\n  const [uploading, setUploading] = useState(false);"
);

const uploadLogic = `
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
          'Authorization': \`Bearer \${(await supabase.auth.getSession()).data.session?.access_token}\`
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
`;

code = code.replace(/const handleCreate = async.*?catch \(e: any\) \{\n      setError\(e\.message\);\n    \}\n  \};/s, uploadLogic);

const fileInputHtml = `
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
`;

code = code.replace(
/              <div>\n                <label className="block text-sm font-semibold text-slate-700 mb-1">Image URL<\/label>\n                <input\n                  type="url"\n                  required\n                  value={imageUrl}\n                  onChange={e => setImageUrl\(e.target.value\)}\n                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"\n                  placeholder="https:\/\/example.com\/image.jpg"\n                \/>\n              <\/div>/s,
  fileInputHtml
);

code = code.replace(
  ">Add Image</button>",
  " disabled={uploading}>\n                  {uploading ? 'Uploading...' : 'Add Image'}\n                </button>"
);

fs.writeFileSync('src/pages/Admin/Gallery.tsx', code);
