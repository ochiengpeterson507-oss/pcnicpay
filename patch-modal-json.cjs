const fs = require('fs');
let code = fs.readFileSync('src/components/PaystackPaymentModal.tsx', 'utf8');

code = code.replace(
  `        const res = await fetch('/api/payments/paystack/verify', {
           method: 'POST',
           headers: {
             'Content-Type': 'application/json',
             'Authorization': \`Bearer \${localStorage.getItem('token')}\`
           },
           body: JSON.stringify({ reference: reference.reference })
        });
        const data = await res.json();`,
  `        const res = await fetch('/api/payments/paystack/verify', {
           method: 'POST',
           headers: {
             'Content-Type': 'application/json',
             'Authorization': \`Bearer \${localStorage.getItem('token')}\`
           },
           body: JSON.stringify({ reference: reference.reference })
        });
        
        let data;
        try {
          data = await res.json();
        } catch (e) {
          throw new Error('Invalid server response');
        }`
);

code = code.replace(
  `        body: JSON.stringify({
          amount: parseInt(paymentAmount),
          currency: paystackCurrency,
          email: user?.email || ''
        })
      });
      const data = await res.json();
      if (!res.ok) {`,
  `        body: JSON.stringify({
          amount: parseInt(paymentAmount),
          currency: paystackCurrency,
          email: user?.email || ''
        })
      });
      
      let data;
      try {
        data = await res.json();
      } catch (e) {
        setPaymentStatus('error');
        setPaymentMessage('Invalid server response: ' + res.status);
        return;
      }
      
      if (!res.ok) {`
);

fs.writeFileSync('src/components/PaystackPaymentModal.tsx', code);
console.log('Patched modal json parses');
