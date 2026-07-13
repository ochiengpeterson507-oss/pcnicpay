const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const patches = [
  {
    search: "      const { data, error } = await getSupabase().from('User').update({ role }).eq('id', req.params.id).select().single();\n      if (error) throw error;\n\n  \n  apiRouter.post('/expenses',",
    replace: "      const { data, error } = await getSupabase().from('User').update({ role }).eq('id', req.params.id).select().single();\n      if (error) throw error;\n      res.json(data);\n    } catch (err: any) {\n      res.status(500).json({ error: err.message });\n    }\n  });\n\n  apiRouter.post('/expenses',"
  },
  {
    search: "      if (error) throw error;\n\n\n  \n\n  // Admin CRUD for Posters",
    replace: "      if (error) throw error;\n      res.json(data);\n    } catch (err: any) {\n      res.status(500).json({ error: err.message });\n    }\n  });\n\n  // Admin CRUD for Posters"
  },
  {
    search: "        .eq('id', req.params.id)\n        .select().single();\n      if (error) throw error;\n\n\n  apiRouter.delete('/expenses/:id',",
    replace: "        .eq('id', req.params.id)\n        .select().single();\n      if (error) throw error;\n      res.json(data);\n    } catch (err: any) {\n      res.status(500).json({ error: err.message });\n    }\n  });\n\n  apiRouter.delete('/expenses/:id',"
  }
];

patches.forEach(p => {
    code = code.replace(p.search, p.replace);
});

fs.writeFileSync('server.ts', code);
