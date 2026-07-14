const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  "emitEvent('new-payment', payment);\n          \n          await getSupabase().from('Notification').insert({\n             title: 'Payment Received',\n             message: `Your contribution of ${data.data.currency || 'KES'} ${amount} was received successfully.`,\n             userId: userId\n          });\n          \n          if (insertError) { console.error('Insert error:', insertError); return res.status(500).json({ error: insertError }); }",
  "if (insertError) {\n            console.error('Insert error:', insertError);\n            return res.status(500).json({ error: insertError.message || insertError });\n          }\n\n          emitEvent('new-payment', payment);\n          \n          await getSupabase().from('Notification').insert({\n             title: 'Payment Received',\n             message: `Your contribution of ${data.data.currency || 'KES'} ${amount} was received successfully.`,\n             userId: userId\n          });"
);

fs.writeFileSync('server.ts', code);
