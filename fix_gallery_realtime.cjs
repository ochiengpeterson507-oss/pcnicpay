const fs = require('fs');
let code = fs.readFileSync('src/pages/Admin/Gallery.tsx', 'utf8');

if (!code.includes("supabase.channel")) {
  code = code.replace(
    "  useEffect(() => {\n    fetchItems();\n  }, [supabase]);",
    `  useEffect(() => {
    fetchItems();
    if (!supabase) return;
    const channel = supabase.channel('gallery-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'Gallery' }, () => {
        fetchItems();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [supabase]);`
  );
  fs.writeFileSync('src/pages/Admin/Gallery.tsx', code);
}
