const fs = require('fs');

function patchFile(file) {
  if (!fs.existsSync(file)) return;
  let code = fs.readFileSync(file, 'utf8');
  
  // Replace direct res.json() calls in then()
  code = code.replace(/\.then\(res => res\.json\(\)\)/g, 
    `.then(async res => {
      const text = await res.text();
      try { return JSON.parse(text); } 
      catch (e) { console.error('Expected JSON, got:', text.substring(0, 50)); throw new Error('Invalid JSON response'); }
    })`);
    
  // Replace direct res.json() calls in await
  // We've already patched Login and Register, but let's check for others
  
  fs.writeFileSync(file, code);
}

['src/pages/Admin/Contributions.tsx', 'src/pages/Admin/Reports.tsx', 'src/components/SupabaseProvider.tsx', 'src/components/PaystackPaymentModal.tsx'].forEach(patchFile);
console.log('Patched');
