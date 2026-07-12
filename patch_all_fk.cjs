const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Fix /payments/simulate
code = code.replace(
  /\.insert\(\{([\s\S]*?)\}\)\.select\('\*, user:User\(name, avatarUrl\)'\)\.single\(\);/g,
  `.insert({$1}).select('*').single();
      if (payment) {
        const { data: user } = await getSupabase().from('User').select('name, avatarUrl').eq('id', payment.user_id).single();
        payment.user = user;
        payment.reference = payment.payment_reference;
        payment.status = payment.payment_status;
        payment.userId = payment.user_id;
      }`
);

// Fix Expense GET
const getExpensesStr = `
  apiRouter.get('/expenses', authenticateToken, async (req, res) => {
    try {
      const { data: expenses, error } = await getSupabase().from('Expense').select('*').order('createdAt', { ascending: false });
      if (error) throw error;
      
      const userIds = [...new Set((expenses || []).map(e => e.recordedById).filter(Boolean))];
      const { data: users } = await getSupabase().from('User').select('id, name').in('id', userIds);
      const userMap = (users || []).reduce((acc, u) => { acc[u.id] = u; return acc; }, {});
      
      const mapped = (expenses || []).map(e => ({ ...e, user: userMap[e.recordedById] || null }));
      res.json(mapped);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
`;

code = code.replace(/apiRouter\.get\('\/expenses', authenticateToken, async \(req, res\) => \{[\s\S]*?\}\);/m, getExpensesStr.trim());

fs.writeFileSync('server.ts', code);
