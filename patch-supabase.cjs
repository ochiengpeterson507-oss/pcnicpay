const fs = require('fs');
let code = fs.readFileSync('src/components/SupabaseProvider.tsx', 'utf8');

code = code.replace(
  /fetch\('\/api\/config'\)/,
  "setTimeout(() => { setLoading(false) }, 3000);\n    fetch('/api/config')"
);

fs.writeFileSync('src/components/SupabaseProvider.tsx', code);
