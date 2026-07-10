const fs = require('fs');
let code = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

// Replace imports
code = code.replace(
  'import { usePaystackPayment } from "react-paystack";',
  'import PaystackPaymentModal from "../components/PaystackPaymentModal";'
);

// Remove state variables
code = code.replace(/  const \[paymentAmount, setPaymentAmount\] = useState\(''\);\n/g, '');
code = code.replace(/  const \[phoneNumber, setPhoneNumber\] = useState\(user\?\.phone \|\| ''\);\n/g, '');
code = code.replace(/  const \[paymentStatus, setPaymentStatus\] = useState<'idle' \| 'loading' \| 'success' \| 'error'>\('idle'\);\n/g, '');
code = code.replace(/  const \[paymentMessage, setPaymentMessage\] = useState\(''\);\n/g, '');
code = code.replace(/  const \[paystackKey, setPaystackKey\] = useState\(''\);\n/g, '');
code = code.replace(/  const \[paystackCurrency, setPaystackCurrency\] = useState\('KES'\);\n/g, '');

// Remove the fetch config block
const configEffect = `  useEffect(() => {
    fetch('/api/config').then(res => res.json()).then(data => {
      setPaystackKey(data.paystackPublicKey || '');
      setPaystackCurrency(data.paystackCurrency || 'KES');
    }).catch(console.error);
  }, []);`;
code = code.replace(configEffect, '');

// Fix socket handlers
const socketBlock = `    socket.on('new-payment', (payment) => {
      setPayments((prev) => [payment, ...prev]);
      fetchStats();
      if (isPaymentModalOpen) {
          setPaymentStatus('success');
          setPaymentMessage(\`Success! KES \${payment.amount} received. Ref: \${payment.reference}\`);
          setTimeout(() => setIsPaymentModalOpen(false), 3000);
      }
    });
    socket.on('payment-failed', (data) => {
      if (isPaymentModalOpen) {
          setPaymentStatus('error');
          setPaymentMessage(\`Payment failed: \${data.reason}\`);
      }
    });`;

const newSocketBlock = `    socket.on('new-payment', (payment) => {
      setPayments((prev) => [payment, ...prev]);
      fetchStats();
    });
    socket.on('payment-failed', (data) => {
      console.log('Payment failed:', data);
    });`;
code = code.replace(socketBlock, newSocketBlock);

// Remove the `isPaymentModalOpen` dependency from the useEffect
code = code.replace(
  `  }, [isPaymentModalOpen, supabase]);`,
  `  }, [supabase]);`
);

fs.writeFileSync('src/pages/Dashboard.tsx', code);
console.log('Patched top part');
