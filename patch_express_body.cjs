const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  "app.use(express.json());",
  "app.use((req, res, next) => {\n  if (req.body && Object.keys(req.body).length > 0) {\n    // Vercel already parsed it\n    next();\n  } else {\n    express.json()(req, res, next);\n  }\n});"
);

fs.writeFileSync('server.ts', code);
