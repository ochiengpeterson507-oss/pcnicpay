const fs = require('fs');
let code = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

code = code.replace(
`    // socket.on('new-payment', (payment) => {
      setStats(prev => ({
        ...prev,
        collected: prev.collected + payment.amount
      }));
      setPayments(prev => [payment, ...prev]);
    });

    // socket.on('payment-failed', (data) => {
      console.log('Payment failed:', data);
    });`,
`    // socket.on disabled
`);

fs.writeFileSync('src/pages/Dashboard.tsx', code);
