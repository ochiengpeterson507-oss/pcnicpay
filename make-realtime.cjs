const fs = require('fs');

// 1. Update Contributions.tsx
let cont = fs.readFileSync('src/pages/Admin/Contributions.tsx', 'utf8');
if (!cont.includes('useSupabase')) {
  cont = "import { useSupabase } from '../../components/SupabaseProvider';\n" + cont;
  
  const realtimeCont = `
  const supabase = useSupabase();

  useEffect(() => {
    fetchPayments();
    
    if (supabase) {
      const channel = supabase.channel('contributions-updates')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'Payment' }, payload => {
          fetchPayments();
        })
        .subscribe();
      return () => { supabase.removeChannel(channel); };
    }
  }, [supabase]);
  `;
  
  cont = cont.replace(/useEffect\(\(\) => \{\n    fetchPayments\(\);\n  \}, \[\]\);/, realtimeCont);
  fs.writeFileSync('src/pages/Admin/Contributions.tsx', cont);
  console.log('Updated Contributions.tsx');
}

// 2. Update Expenses.tsx
let exp = fs.readFileSync('src/pages/Admin/Expenses.tsx', 'utf8');
if (!exp.includes('useSupabase')) {
  exp = "import { useSupabase } from '../../components/SupabaseProvider';\n" + exp;
  
  const realtimeExp = `
  const supabase = useSupabase();

  useEffect(() => {
    fetchExpenses();
    
    if (supabase) {
      const channel = supabase.channel('expenses-updates')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'Expense' }, payload => {
          fetchExpenses();
        })
        .subscribe();
      return () => { supabase.removeChannel(channel); };
    }
  }, [supabase]);
  `;
  
  exp = exp.replace(/useEffect\(\(\) => \{\n    fetchExpenses\(\);\n  \}, \[\]\);/, realtimeExp);
  fs.writeFileSync('src/pages/Admin/Expenses.tsx', exp);
  console.log('Updated Expenses.tsx');
}

// 3. Update Reports.tsx
let rep = fs.readFileSync('src/pages/Admin/Reports.tsx', 'utf8');
if (!rep.includes('useSupabase')) {
  rep = "import { useSupabase } from '../../components/SupabaseProvider';\n" + rep;
  
  const realtimeRep = `
  const supabase = useSupabase();

  const fetchPayments = () => {
    fetch('/api/payments', { headers: { 'Authorization': \`Bearer \${localStorage.getItem('token')}\` } })
      .then(res => res.json())
      .then(data => { setPayments(data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchPayments();
    
    if (supabase) {
      const channel = supabase.channel('reports-updates')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'Payment' }, payload => {
          fetchPayments();
        })
        .subscribe();
      return () => { supabase.removeChannel(channel); };
    }
  }, [supabase]);
  `;
  
  rep = rep.replace(/useEffect\(\(\) => \{[\s\S]*?\}, \[\]\);/, realtimeRep);
  fs.writeFileSync('src/pages/Admin/Reports.tsx', rep);
  console.log('Updated Reports.tsx');
}

