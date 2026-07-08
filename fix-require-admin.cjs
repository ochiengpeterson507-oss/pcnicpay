const fs = require('fs');

let server = fs.readFileSync('server.ts', 'utf8');

const requireAdminCode = `
  const requireAdmin = (req: any, res: any, next: any) => {
    if (req.user && req.user.role === 'ADMIN') {
      next();
    } else {
      res.sendStatus(403);
    }
  };
`;

server = server.replace(/const authenticateToken =[\s\S]*?next\(\);\n    \}\);\n  \};\n/m, match => match + '\n' + requireAdminCode);

fs.writeFileSync('server.ts', server);
console.log("Added requireAdmin");
