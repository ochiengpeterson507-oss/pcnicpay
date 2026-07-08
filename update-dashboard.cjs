const fs = require('fs');
let code = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

const useSupabaseImport = `import { useSupabase } from '../components/SupabaseProvider';\n`;
code = useSupabaseImport + code;

// Replace existing useEffect and add supabase listening
// Actually, it already has:
// useEffect(() => {
//   fetchStats();
//   fetchPayments();
//   socket.on(...);
//   return () => socket.off(...);
// }, [isPaymentModalOpen]);

const newHook = `
  const supabase = useSupabase();
  useEffect(() => {
    fetchStats();
    fetchPayments();
    
    // Existing socket for push notifications from backend simulation
    socket.on('new-payment', (payment) => {
      setPayments((prev) => [payment, ...prev]);
      fetchStats();
      if (isPaymentModalOpen) {
          setPaymentStatus('success');
          setPaymentMessage(\`Success! KES \${payment.amount} received. Ref: \${payment.reference}\`);
          setTimeout(() => setIsPaymentModalOpen(false), 3000);
      }
    });
    socket.on('payment-failed', (data) => {
      if (isPaymentModalOpen) {
          setPaymentStatus('error');
          setPaymentMessage(\`Payment failed: \${data.reason}\`);
      }
    });
    
    // Supabase Realtime
    let channel: any;
    if (supabase) {
      channel = supabase.channel('member-dashboard-updates')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'Payment' }, payload => {
          fetchStats();
          fetchPayments();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'Expense' }, payload => {
          fetchStats();
        })
        .subscribe();
    }

    return () => {
      socket.off('new-payment');
      socket.off('payment-failed');
      if (channel) supabase.removeChannel(channel);
    };
  }, [isPaymentModalOpen, supabase]);
`;

code = code.replace(/useEffect\(\(\) => \{[\s\S]*?\}, \[isPaymentModalOpen\]\);/, newHook);
fs.writeFileSync('src/pages/Dashboard.tsx', code);
console.log("Updated Dashboard realtime");
