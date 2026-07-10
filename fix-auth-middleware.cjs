const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
`  // Auth Middleware
  const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    });
  };`,
`  // Auth Middleware using Supabase
  const authenticateToken = async (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401);

    const { data: { user }, error } = await getSupabase().auth.getUser(token);
    if (error || !user) {
      return res.sendStatus(403);
    }
    
    // Attach user id and get role from public.User if needed, but simple auth is fine:
    req.user = { id: user.id, email: user.email };
    next();
  };`
);

fs.writeFileSync('server.ts', code);
