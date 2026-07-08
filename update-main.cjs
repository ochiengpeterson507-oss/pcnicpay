const fs = require('fs');
let main = fs.readFileSync('src/main.tsx', 'utf8');

const imports = `import { SupabaseProvider } from './components/SupabaseProvider';\n`;
main = imports + main;
main = main.replace('<App />', '<SupabaseProvider><App /></SupabaseProvider>');

fs.writeFileSync('src/main.tsx', main);
console.log("Updated main.tsx");
