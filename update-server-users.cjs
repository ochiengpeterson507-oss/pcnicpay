const fs = require('fs');
let server = fs.readFileSync('server.ts', 'utf8');

const userApiCode = `
  // Admin User Management
  const requireAdmin = (req, res, next) => {
    if (req.user.role !== 'ADMIN') return res.sendStatus(403);
    next();
  };

  apiRouter.get('/users', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const { data: users, error } = await getSupabase().from('User').select('*').order('createdAt', { ascending: false });
      if (error) throw error;
      res.json(users);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  apiRouter.put('/users/:id/role', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const { role } = req.body;
      const { data, error } = await getSupabase().from('User').update({ role }).eq('id', req.params.id).select().single();
      if (error) throw error;
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  apiRouter.post('/expenses', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const { title, amount, category, date } = req.body;
      const { data, error } = await getSupabase().from('Expense').insert({
        title, amount, category, date, recordedById: req.user.id
      }).select().single();
      if (error) throw error;
      io.emit('new-expense', data);
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  apiRouter.get('/expenses', authenticateToken, async (req, res) => {
    try {
      const { data, error } = await getSupabase().from('Expense').select('*, user:User(name)').order('createdAt', { ascending: false });
      if (error) throw error;
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
`;

// Insert the new API code before app.use('/api', apiRouter);
server = server.replace("app.use('/api', apiRouter);", userApiCode + "\n  app.use('/api', apiRouter);");
fs.writeFileSync('server.ts', server);
console.log("Updated server.ts with User and Expense routes");
