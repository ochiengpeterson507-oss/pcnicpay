const fs = require('fs');
let code = fs.readFileSync('src/pages/Admin/Posters.tsx', 'utf8');

if (!code.includes("supabase.channel")) {
  code = code.replace(
    "import { safeFetchJson, safeFetch } from '../../utils/safeFetch';",
    "import { safeFetchJson, safeFetch } from '../../utils/safeFetch';\nimport { useSupabase } from '../../components/SupabaseProvider';"
  );
  code = code.replace(
    "  const { token } = useAuth();",
    "  const { token } = useAuth();\n  const supabase = useSupabase();"
  );
  code = code.replace(
    "  useEffect(() => {\n    fetchPosters();\n  }, []);",
    `  useEffect(() => {
    fetchPosters();
    if (!supabase) return;
    const channel = supabase.channel('posters-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'Poster' }, () => {
        fetchPosters();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [supabase]);`
  );
  fs.writeFileSync('src/pages/Admin/Posters.tsx', code);
}
