const fs = require('fs');

const filesToPatch = [
  'src/components/PaystackPaymentModal.tsx',
  'src/pages/Login.tsx',
  'src/pages/Register.tsx',
  'src/components/SupabaseProvider.tsx'
];

for (const file of filesToPatch) {
  if (!fs.existsSync(file)) continue;
  let code = fs.readFileSync(file, 'utf8');
  
  if (file === 'src/components/PaystackPaymentModal.tsx') {
    code = code.replace(
      `fetch('/api/config').then(res => res.json()).then(data => {`,
      `fetch('/api/config').then(res => {
      if (!res.ok) throw new Error('Failed to fetch config');
      return res.json();
    }).then(data => {`
    );
  }
  
  if (file === 'src/pages/Login.tsx' || file === 'src/pages/Register.tsx') {
    code = code.replace(
      `const data = await res.json();`,
      `if (!res.ok) {
        const text = await res.text();
        let errorMsg = 'Failed to authenticate';
        try { errorMsg = JSON.parse(text).error || errorMsg; } catch (e) { console.error('Non-JSON error response:', text); }
        setError(errorMsg);
        return;
      }
      const data = await res.json();`
    );
  }
  
  if (file === 'src/components/SupabaseProvider.tsx') {
    code = code.replace(
      `fetch('/api/config')\n      .then(res => res.json())`,
      `fetch('/api/config')
      .then(res => {
        if (!res.ok) throw new Error('Config fetch failed');
        return res.json();
      })`
    );
  }
  
  fs.writeFileSync(file, code);
}
console.log('Patched JSON parses');
