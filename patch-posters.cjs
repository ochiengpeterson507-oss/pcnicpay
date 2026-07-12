const fs = require('fs');
let code = fs.readFileSync('src/pages/Admin/Posters.tsx', 'utf8');

code = code.replace(
  /await safeFetch\(\`\/api\/posters\/\$\{editingPoster\.id\}\`/,
  "await safeFetch(`/api/posters/${editingPoster.id}`"
);

code = code.replace(
  /await safeFetch\(\`\/api\/posters\/\$\{id\}\`/,
  "await safeFetch(`/api/posters/${id}`"
);

code = code.replace(
  /'Authorization': \\\`Bearer \\\$\{token\}\\\`/g,
  "'Authorization': `Bearer ${token}`"
);

fs.writeFileSync('src/pages/Admin/Posters.tsx', code);
