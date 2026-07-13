const fs = require('fs');
let code = fs.readFileSync('src/main.tsx', 'utf8');

code = code.replace(
  "import App from './App.tsx';",
  "import App from './App.tsx';\nimport { QueryClient, QueryClientProvider } from '@tanstack/react-query';"
);

code = code.replace(
  "<SupabaseProvider><App /></SupabaseProvider>",
  "<QueryClientProvider client={new QueryClient()}><SupabaseProvider><App /></SupabaseProvider></QueryClientProvider>"
);

fs.writeFileSync('src/main.tsx', code);
