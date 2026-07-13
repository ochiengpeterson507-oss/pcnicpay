const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  /      if \(error\) throw error;\n    apiRouter\.post\('\/upload',/g,
  "      if (error) throw error;\n      res.json(data);\n    } catch (err: any) {\n      res.status(500).json({ error: err.message });\n    }\n  });\n\n  apiRouter.post('/upload',"
);

fs.writeFileSync('server.ts', code);
