const fs = require('fs');
let server = fs.readFileSync('server.ts', 'utf8');

const configCode = `
  apiRouter.get('/config', (req, res) => {
    res.json({
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    });
  });
`;

server = server.replace("app.use('/api', apiRouter);", configCode + "\n  app.use('/api', apiRouter);");
fs.writeFileSync('server.ts', server);
console.log("Updated config");
