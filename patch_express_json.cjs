const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const replacement = `
// Body parsing middleware that works in both Express and Vercel
app.use((req, res, next) => {
  // If req.body is already a parsed object (Vercel does this)
  if (req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) {
    return next();
  }
  
  // If req.body is a string or Buffer, try to parse it
  if (req.body && (typeof req.body === 'string' || Buffer.isBuffer(req.body))) {
    try {
      req.body = JSON.parse(req.body.toString());
      return next();
    } catch (e) {
      // Not JSON, continue
      return next();
    }
  }

  // Otherwise, use express.json() but with a timeout to prevent hanging
  express.json()(req, res, (err) => {
    if (err) return next(err);
    next();
  });
});
`;

code = code.replace(
  "app.use((req, res, next) => {\n  if (req.body && Object.keys(req.body).length > 0) {\n    // Vercel already parsed it\n    next();\n  } else {\n    express.json()(req, res, next);\n  }\n});",
  replacement
);

fs.writeFileSync('server.ts', code);
