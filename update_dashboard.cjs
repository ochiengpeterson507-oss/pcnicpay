const fs = require('fs');
let code = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

if (!code.includes('table: \'Gallery\'')) {
  code = code.replace(
    /\.on\('postgres_changes', \{ event: '\*', schema: 'public', table: 'Announcement' \}, payload => \{\n          fetchAnnouncements\(\);\n        \}\)/g,
    `.on('postgres_changes', { event: '*', schema: 'public', table: 'Announcement' }, payload => {
          fetchAnnouncements();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'Gallery' }, payload => {
          fetchGallery();
        })`
  );
}

if (!code.includes('async function fetchGallery')) {
  code = code.replace(
    /async function fetchAnnouncements/,
    `async function fetchGallery() {
    if (!supabase) return;
    try {
      const { data, error } = await supabase
        .from('Gallery')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(4);
      if (!error && data) {
        setGalleryItems(data);
      }
    } catch (err) {
      console.error('Failed to fetch gallery', err);
    }
  }

  async function fetchAnnouncements`
  );
}

code = code.replace('if (channel) supabase.removeChannel(channel);', 'if (channel && supabase) supabase.removeChannel(channel);');

fs.writeFileSync('src/pages/Dashboard.tsx', code);
