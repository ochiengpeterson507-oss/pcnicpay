const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const replacements = [
  {
    search: /      if \(error\) throw error;\n    apiRouter\.post\('\/expenses',/g,
    replace: `      if (error) throw error;\n      res.json(data);\n    } catch (err) {\n      res.status(500).json({ error: err.message });\n    }\n  });\n\n  apiRouter.post('/expenses',`
  },
  {
    search: /      emitEvent\('new-expense', data\);\n  apiRouter\.get\('\/expenses',/g,
    replace: `      emitEvent('new-expense', data);\n      res.json(data);\n    } catch (err) {\n      res.status(500).json({ error: err.message });\n    }\n  });\n\n  apiRouter.get('/expenses',`
  },
  {
    search: /      if \(error\) throw error;\n  apiRouter\.put\('\/notifications\/:id\/read',/g,
    replace: `      if (error) throw error;\n      res.json(data);\n    } catch (err) {\n      res.status(500).json({ error: err.message });\n    }\n  });\n\n  apiRouter.put('/notifications/:id/read',`
  },
  {
    search: /      if \(error\) throw error;\n    \/\/ Admin CRUD for Posters/g,
    replace: `      if (error) throw error;\n      res.json(data);\n    } catch (err) {\n      res.status(500).json({ error: err.message });\n    }\n  });\n\n  // Admin CRUD for Posters`
  },
  {
    search: /      if \(error\) throw error;\n  apiRouter\.delete\('\/expenses\/:id',/g,
    replace: `      if (error) throw error;\n      res.json(data);\n    } catch (err) {\n      res.status(500).json({ error: err.message });\n    }\n  });\n\n  apiRouter.delete('/expenses/:id',`
  }
];

replacements.forEach(r => {
  code = code.replace(r.search, r.replace);
});

fs.writeFileSync('server.ts', code);
