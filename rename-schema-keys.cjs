const fs = require('fs');

const filesToUpdate = [
  'src/pages/Dashboard.tsx',
  'src/pages/Admin/Contributions.tsx',
  'src/pages/Admin/Overview.tsx',
  'server.ts' // for anything I might have missed
];

filesToUpdate.forEach(file => {
  if (fs.existsSync(file)) {
    let code = fs.readFileSync(file, 'utf8');
    
    // Front-end property access
    code = code.replace(/payment\.reference/g, 'payment.payment_reference');
    code = code.replace(/payment\.status/g, 'payment.payment_status');
    code = code.replace(/payment\.date/g, 'payment.paid_at');
    code = code.replace(/payment\.createdAt/g, 'payment.created_at');
    code = code.replace(/payment\.userId/g, 'payment.user_id');
    
    // Additional backend mappings (already done manually mostly, but just in case)
    if (file === 'server.ts') {
       // update some select calls if needed
    }
    
    fs.writeFileSync(file, code);
  }
});
console.log('Renamed schema properties in code.');
