const fs = require('fs');
let code = fs.readFileSync('src/components/PaystackPaymentModal.tsx', 'utf8');

const target1 = `        let data;
        try {
          data = await res.json();
        } catch (e) {
          throw new Error('Invalid server response');
        }`;

const replacement1 = `        if (!res.ok) {
           const text = await res.text();
           console.error("Paystack verify error:", res.status, text);
           throw new Error(text.substring(0, 100));
        }
        let data;
        try {
          data = await res.json();
        } catch (e) {
          throw new Error('Invalid server response');
        }`;

code = code.replace(target1, replacement1);

const target2 = `      let data;
      try {
        data = await res.json();
      } catch (e) {
        setPaymentStatus('error');
        setPaymentMessage('Invalid server response: ' + res.status);
        return;
      }
      
      if (!res.ok) {
         setPaymentStatus('error');
         setPaymentMessage(data.error || 'Failed to initialize payment');
         return;
      }`;

const replacement2 = `      if (!res.ok) {
         let errMsg = 'Failed to initialize payment';
         try {
           const errData = await res.json();
           errMsg = errData.error || errMsg;
         } catch(e) {
           errMsg = 'Invalid server response: ' + res.status;
         }
         setPaymentStatus('error');
         setPaymentMessage(errMsg);
         return;
      }

      let data;
      try {
        data = await res.json();
      } catch (e) {
        setPaymentStatus('error');
        setPaymentMessage('Invalid server response: ' + res.status);
        return;
      }`;

code = code.replace(target2, replacement2);
fs.writeFileSync('src/components/PaystackPaymentModal.tsx', code);
