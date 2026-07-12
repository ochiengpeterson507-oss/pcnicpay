const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const safeFetchCodeInitialize = `
      const response = await fetch('https://api.paystack.co/transaction/initialize', {
        method: 'POST',
        headers: {
          Authorization: \`Bearer \${process.env.PAYSTACK_SECRET_KEY}\`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: amount * 100,
          email,
          currency,
          reference: new Date().getTime().toString()
        })
      });
      
      const contentType = response.headers.get("content-type");
      if (!response.ok) {
          const text = await response.text();
          console.error("Paystack Init Error:", response.status, text);
          throw new Error(text);
      }
      if (!contentType?.includes("application/json")) {
          const text = await response.text();
          console.error("Paystack Init HTML instead of JSON:", response.status, text);
          throw new Error(\`Expected JSON but received:\\n\${text.substring(0, 200)}\`);
      }
      
      const data = await response.json();
`;

code = code.replace(
  /const response = await fetch\('https:\/\/api\.paystack\.co\/transaction\/initialize'[\s\S]*?const data = await response\.json\(\);/,
  safeFetchCodeInitialize
);

const safeFetchCodeVerify = `
      const response = await fetch(\`https://api.paystack.co/transaction/verify/\${reference}\`, {
        headers: {
          Authorization: \`Bearer \${process.env.PAYSTACK_SECRET_KEY}\`
        }
      });
      
      const contentType = response.headers.get("content-type");
      if (!response.ok) {
          const text = await response.text();
          console.error("Paystack Verify Error:", response.status, text);
          throw new Error(text);
      }
      if (!contentType?.includes("application/json")) {
          const text = await response.text();
          console.error("Paystack Verify HTML instead of JSON:", response.status, text);
          throw new Error(\`Expected JSON but received:\\n\${text.substring(0, 200)}\`);
      }
            
      const data = await response.json();
`;

code = code.replace(
  /const response = await fetch\(`https:\/\/api\.paystack\.co\/transaction\/verify\/\$\{reference\}`[\s\S]*?const data = await response\.json\(\);/,
  safeFetchCodeVerify
);

fs.writeFileSync('server.ts', code);
