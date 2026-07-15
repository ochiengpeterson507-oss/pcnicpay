const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const replacement = `
// Body parsing middleware that works in both Express and Vercel
app.use((req, res, next) => {
  // Exclude webhook from global parsing
  if (req.originalUrl && req.originalUrl.includes('/webhook')) {
    return next();
  }
  
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
  /\/\/ Body parsing middleware that works in both Express and Vercel[\s\S]*?    if \(err\) return next\(err\);\n    next\(\);\n  \}\);\n\}\);/,
  replacement
);

fs.writeFileSync('server.ts', code);
