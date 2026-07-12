const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Fix GET /payments
const getPaymentsStr = `
  apiRouter.get('/payments', async (req: any, res: any) => {
    try {
      const { data: payments } = await getSupabase().from('Payment')
        .select('*')
        .order('date', { ascending: false });
        
      const userIds = [...new Set((payments || []).map(p => p.user_id).filter(Boolean))];
      const { data: users } = await getSupabase().from('User').select('id, name, avatarUrl').in('id', userIds);
      
      const userMap = (users || []).reduce((acc, u) => {
        acc[u.id] = u;
        return acc;
      }, {});

      res.json((payments || []).map(p => ({ 
        ...p, 
        reference: p.payment_reference, 
        status: p.payment_status, 
        userId: p.user_id,
        user: userMap[p.user_id] || null
      })));
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message || 'Server error' });
    }
  });
`;

code = code.replace(/apiRouter\.get\('\/payments', async \(req: any, res: any\) => \{[\s\S]*?\}\);/m, getPaymentsStr.trim());

// Fix POST /payments/manual
const postManualStr = `
  // Add Manual Payment (Cash/Transfer)
  apiRouter.post('/payments/manual', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const { userId, amount, reference, date, status } = req.body;
      const { data, error } = await getSupabase().from('Payment').insert({
        user_id: userId, amount, payment_reference: reference, date, payment_status: status, phoneNumber: 'Manual'
      }).select('*').single();
      if (error) throw error;
      
      const { data: user } = await getSupabase().from('User').select('name, avatarUrl').eq('id', userId).single();
      
      const mappedData = { ...data, reference: data.payment_reference, status: data.payment_status, userId: data.user_id, user };
      emitEvent('new-payment', mappedData);
      res.json(mappedData);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
`;

code = code.replace(/\/\/ Add Manual Payment \(Cash\/Transfer\)[\s\S]*?apiRouter\.post\('\/payments\/manual'[\s\S]*?\}\);/m, postManualStr.trim());

fs.writeFileSync('server.ts', code);
