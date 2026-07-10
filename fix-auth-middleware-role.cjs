const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
`    // Attach user id and get role from public.User if needed, but simple auth is fine:
    req.user = { id: user.id, email: user.email };`,
`    const { data: dbUser } = await getSupabase().from('User').select('role').eq('id', user.id).single();
    req.user = { id: user.id, email: user.email, role: dbUser?.role || 'MEMBER' };`
);

fs.writeFileSync('server.ts', code);
