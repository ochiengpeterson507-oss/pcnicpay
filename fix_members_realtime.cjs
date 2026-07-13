const fs = require('fs');
let code = fs.readFileSync('src/pages/Admin/Members.tsx', 'utf8');

if (!code.includes("useSupabase")) {
  code = code.replace(
    "import { useAuth } from '../../components/AuthProvider';",
    "import { useAuth } from '../../components/AuthProvider';\nimport { useSupabase } from '../../components/SupabaseProvider';"
  );
  code = code.replace(
    "  const { token } = useAuth();",
    "  const { token } = useAuth();\n  const supabase = useSupabase();"
  );
  code = code.replace(
    "  useEffect(() => {\n    fetchMembers();\n  }, []);",
    `  useEffect(() => {
    fetchMembers();
    if (!supabase) return;
    const channel = supabase.channel('members-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'User' }, () => {
        fetchMembers();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [supabase]);`
  );
  fs.writeFileSync('src/pages/Admin/Members.tsx', code);
}
