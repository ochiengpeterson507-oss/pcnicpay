const fs = require('fs');
let code = fs.readFileSync('src/pages/Admin/Overview.tsx', 'utf8');

const useSupabaseImport = `import { useSupabase } from '../../components/SupabaseProvider';\n`;
code = useSupabaseImport + code;

const realtimeLogic = `
  const supabase = useSupabase();

  useEffect(() => {
    fetchStats();
    fetchPayments();
    
    if (supabase) {
      const channel = supabase.channel('dashboard-updates')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'Payment' }, payload => {
          fetchStats();
          fetchPayments();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'Expense' }, payload => {
          fetchStats();
        })
        .subscribe();
        
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [supabase]);
`;

code = code.replace(/useEffect\(\(\) => \{\n    fetchStats\(\);\n    fetchPayments\(\);\n  \}, \[\]\);/, realtimeLogic);
fs.writeFileSync('src/pages/Admin/Overview.tsx', code);
console.log("Updated Overview real-time");
