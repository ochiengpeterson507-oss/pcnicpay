const fs = require('fs');

let code = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

// Add react-paystack import
const imports = `import { usePaystackPayment } from 'react-paystack';\n`;
code = code.replace("import { motion } from 'motion/react';", "import { motion } from 'motion/react';\n" + imports);

// We need paystackPublicKey from config. Let's add it to states or fetch it.
const stateUpdate = `
  const [paystackKey, setPaystackKey] = useState('');
  
  useEffect(() => {
    fetch('/api/config').then(res => res.json()).then(data => {
      setPaystackKey(data.paystackPublicKey || '');
    }).catch(console.error);
  }, []);
`;
code = code.replace("const [paymentMessage, setPaymentMessage] = useState('');", "const [paymentMessage, setPaymentMessage] = useState('');\n" + stateUpdate);

const paymentLogic = `
  const config = {
      reference: (new Date()).getTime().toString(),
      email: user?.email || '',
      amount: parseInt(paymentAmount) * 100, // Paystack requires amount in kobo/cents
      publicKey: paystackKey,
      metadata: {
        custom_fields: [
          {
            display_name: "Phone Number",
            variable_name: "phone",
            value: phoneNumber
          }
        ]
      }
  };
  
  const initializePayment = usePaystackPayment(config);

  const onSuccess = async (reference: any) => {
      setPaymentStatus('loading');
      setPaymentMessage('Verifying payment...');
      try {
        const res = await fetch('/api/payments/paystack/verify', {
           method: 'POST',
           headers: {
             'Content-Type': 'application/json',
             'Authorization': \`Bearer \${localStorage.getItem('token')}\`
           },
           body: JSON.stringify({ reference: reference.reference })
        });
        const data = await res.json();
        if (data.success) {
           setPaymentStatus('success');
           setPaymentMessage(\`Success! KES \${data.payment.amount} received.\`);
           fetchStats();
           fetchPayments();
           setTimeout(() => setIsPaymentModalOpen(false), 3000);
        } else {
           setPaymentStatus('error');
           setPaymentMessage('Payment verification failed.');
        }
      } catch (err) {
        setPaymentStatus('error');
        setPaymentMessage('Payment verification failed.');
      }
  };

  const onClose = () => {
    // Payment cancelled
    setIsPaymentModalOpen(false);
  };

  const initiatePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paystackKey) {
       setPaymentStatus('error');
       setPaymentMessage('Payment gateway configuration missing.');
       return;
    }
    initializePayment({ onSuccess, onClose });
  };
`;

code = code.replace(/const initiatePayment = async \(e: React\.FormEvent\) => \{[\s\S]*?^\s*\};\n/m, paymentLogic);

// Replace "M-Pesa STK Push" mention in UI
code = code.replace("Safaricom number for M-Pesa STK Push.", "Registered phone number.");
code = code.replace("M-Pesa Payment Modal", "Paystack Payment Modal");

fs.writeFileSync('src/pages/Dashboard.tsx', code);
console.log("Updated Dashboard with Paystack inline popup");
