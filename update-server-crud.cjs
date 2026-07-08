const fs = require('fs');
let server = fs.readFileSync('server.ts', 'utf8');

const crudApiCode = `
  // Admin CRUD for Expenses
  apiRouter.put('/expenses/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const { title, amount, category, date } = req.body;
      const { data, error } = await getSupabase().from('Expense')
        .update({ title, amount, category, date })
        .eq('id', req.params.id)
        .select().single();
      if (error) throw error;
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  apiRouter.delete('/expenses/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const { error } = await getSupabase().from('Expense').delete().eq('id', req.params.id);
      if (error) throw error;
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Admin CRUD for Payments
  apiRouter.put('/payments/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const { amount, reference, date, status } = req.body;
      const { data, error } = await getSupabase().from('Payment')
        .update({ amount, reference, date, status })
        .eq('id', req.params.id)
        .select().single();
      if (error) throw error;
      io.emit('payment-updated', data);
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  apiRouter.delete('/payments/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const { error } = await getSupabase().from('Payment').delete().eq('id', req.params.id);
      if (error) throw error;
      io.emit('payment-deleted', { id: req.params.id });
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Add Manual Payment (Cash/Transfer)
  apiRouter.post('/payments/manual', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const { userId, amount, reference, date, status } = req.body;
      const { data, error } = await getSupabase().from('Payment').insert({
        userId, amount, reference, date, status, phoneNumber: 'Manual'
      }).select('*, user:User(name, avatarUrl)').single();
      if (error) throw error;
      io.emit('new-payment', data);
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Admin CRUD for Users
  apiRouter.put('/users/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const { name, email, phone } = req.body;
      const { data, error } = await getSupabase().from('User')
        .update({ name, email, phone })
        .eq('id', req.params.id)
        .select().single();
      if (error) throw error;
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
`;

server = server.replace("app.use('/api', apiRouter);", crudApiCode + "\n  app.use('/api', apiRouter);");

fs.writeFileSync('server.ts', server);
console.log("Updated server.ts with Admin CRUD routes");
