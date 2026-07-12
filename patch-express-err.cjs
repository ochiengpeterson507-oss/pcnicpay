const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  "app.use(express.json());\napp.use((err, req, res, next) => {\n  if (err) return res.status(err.status || 500).json({ error: err.message });\n  next();\n});",
  "app.use(express.json());"
);

// add custom error handler after apiRouter
code = code.replace(
  "app.use('/api', apiRouter);",
  "app.use('/api', apiRouter);\n\napp.use((err, req, res, next) => {\n  console.error('Express Error:', err);\n  res.status(err.status || 500).json({ success: false, error: err.message || 'Internal Server Error' });\n});"
);

// also catch 404 for API routes so it doesn't return HTML
code = code.replace(
  "app.use('/api', apiRouter);",
  "app.use('/api', apiRouter);\napp.use('/api', (req, res) => res.status(404).json({ error: 'API Route Not Found' }));"
);

fs.writeFileSync('server.ts', code);
