const fs = require('fs');
let code = fs.readFileSync('src/pages/Admin/Announcements.tsx', 'utf8');

if (!code.includes("supabase.channel")) {
  code = code.replace(
    "  useEffect(() => {\n    fetchAnnouncements();\n  }, [supabase]);",
    `  useEffect(() => {
    fetchAnnouncements();
    if (!supabase) return;
    const channel = supabase.channel('announcements-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'Announcement' }, () => {
        fetchAnnouncements();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [supabase]);`
  );
  fs.writeFileSync('src/pages/Admin/Announcements.tsx', code);
}
