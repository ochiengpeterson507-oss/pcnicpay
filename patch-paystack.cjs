const fs = require('fs');
let code = fs.readFileSync('src/components/PaystackPaymentModal.tsx', 'utf8');

const replaceFetch = `
    const envKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || import.meta.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;
    const envCurrency = import.meta.env.VITE_PAYSTACK_CURRENCY || 'KES';
    
    if (envKey) {
        setPaystackKey(envKey);
        setPaystackCurrency(envCurrency);
    }
    
    fetch('/api/config').then(async res => {
      if (!res.ok) {
          const text = await res.text();
          throw new Error('Failed to fetch config: ' + text);
      }
      const contentType = res.headers.get("content-type");
      if (!contentType?.includes("application/json")) {
          const text = await res.text();
          throw new Error(\`Expected JSON but received HTML/Text.\\n\${text.substring(0, 150)}\`);
      }
      return res.json();
    }).then(data => {
      if (data.paystackPublicKey) {
          setPaystackKey(data.paystackPublicKey);
      }
      if (data.paystackCurrency) {
          setPaystackCurrency(data.paystackCurrency);
      }
    }).catch(err => {
      console.error("Config fetch error:", err);
      // We don't overwrite if envKey was set
    });
`;

code = code.replace(
  /fetch\('\/api\/config'\)[\s\S]*?\}\)\.catch\(console\.error\);/,
  replaceFetch
);

fs.writeFileSync('src/components/PaystackPaymentModal.tsx', code);
