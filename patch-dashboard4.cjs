const fs = require('fs');
let code = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

const modalRegex = /      \{\/\* Paystack Payment Modal \*\/\}\n      \{isPaymentModalOpen && \([\s\S]*?\)\}\n    <\/div>\n  \);\n\}/g;

code = code.replace(modalRegex, `      {/* Paystack Payment Modal */}
      <PaystackPaymentModal 
        isOpen={isPaymentModalOpen} 
        onClose={() => setIsPaymentModalOpen(false)} 
        onSuccessCallback={() => { fetchStats(); fetchPayments(); }} 
      />
    </div>
  );
}`);

fs.writeFileSync('src/pages/Dashboard.tsx', code);
console.log('Patched modal code');
