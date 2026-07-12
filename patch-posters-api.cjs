const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const postersApi = `
  // Admin CRUD for Posters
  apiRouter.post('/posters', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const { title, description, imageUrl, isActive } = req.body;
      const { data, error } = await getSupabase().from('Poster').insert({
        title, description, imageUrl, isActive
      }).select().single();
      if (error) throw error;
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  apiRouter.get('/posters', async (req, res) => {
    try {
      const { data, error } = await getSupabase().from('Poster').select('*').order('createdAt', { ascending: false });
      if (error) throw error;
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  apiRouter.put('/posters/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const { title, description, imageUrl, isActive } = req.body;
      const { data, error } = await getSupabase().from('Poster')
        .update({ title, description, imageUrl, isActive })
        .eq('id', req.params.id)
        .select().single();
      if (error) throw error;
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  apiRouter.delete('/posters/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const { error } = await getSupabase().from('Poster').delete().eq('id', req.params.id);
      if (error) throw error;
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

`;

code = code.replace(
  "  // Admin CRUD for Expenses",
  postersApi + "  // Admin CRUD for Expenses"
);

fs.writeFileSync('server.ts', code);
