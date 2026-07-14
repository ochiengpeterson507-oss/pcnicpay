const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');
code = code.replace(
  "const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;",
  "const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;"
);
code = code.replace(
  "const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;",
  "const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;"
);
fs.writeFileSync('server.ts', code);
