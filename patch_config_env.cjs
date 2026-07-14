const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');
code = code.replace(
  "supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,",
  "supabaseUrl: process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL,"
);
code = code.replace(
  "supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,",
  "supabaseAnonKey: process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY,"
);
code = code.replace(
  "paystackPublicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || process.env.VITE_PAYSTACK_PUBLIC_KEY,",
  "paystackPublicKey: process.env.PAYSTACK_PUBLIC_KEY || process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || process.env.VITE_PAYSTACK_PUBLIC_KEY,"
);
fs.writeFileSync('server.ts', code);
