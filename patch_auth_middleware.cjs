const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  "  const authenticateToken = async (req: any, res: any, next: any) => {\n    const authHeader = req.headers['authorization'];\n    const token = authHeader && authHeader.split(' ')[1];\n    if (token == null) return res.sendStatus(401);\n\n    const { data: { user }, error } = await getSupabase().auth.getUser(token);\n    if (error || !user) {\n      return res.sendStatus(403);\n    }\n    \n    const { data: dbUser } = await getSupabase().from('User').select('role').eq('id', user.id).single();\n    req.user = { id: user.id, email: user.email, role: dbUser?.role || 'MEMBER' };\n    next();\n  };",
  "  const authenticateToken = async (req: any, res: any, next: any) => {\n    try {\n      const authHeader = req.headers['authorization'];\n      const token = authHeader && authHeader.split(' ')[1];\n      if (!token) return res.status(401).json({ error: 'Unauthorized: No token provided' });\n\n      const { data: { user }, error } = await getSupabase().auth.getUser(token);\n      if (error || !user) {\n        return res.status(403).json({ error: 'Forbidden: Invalid token' });\n      }\n      \n      const { data: dbUser } = await getSupabase().from('User').select('role').eq('id', user.id).single();\n      req.user = { id: user.id, email: user.email, role: dbUser?.role || 'MEMBER' };\n      next();\n    } catch (err: any) {\n      console.error('Auth middleware error:', err);\n      res.status(500).json({ error: 'Internal Server Error during authentication: ' + err.message });\n    }\n  };"
);

code = code.replace(
  "  const requireAdmin = (req: any, res: any, next: any) => {\n    if (req.user && req.user.role === 'ADMIN') {\n      next();\n    } else {\n      res.sendStatus(403);\n    }\n  };",
  "  const requireAdmin = (req: any, res: any, next: any) => {\n    if (req.user && req.user.role === 'ADMIN') {\n      next();\n    } else {\n      res.status(403).json({ error: 'Forbidden: Admin access required' });\n    }\n  };"
);

fs.writeFileSync('server.ts', code);
