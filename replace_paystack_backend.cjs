const fs = require('fs');

let server = fs.readFileSync('server.ts', 'utf8');

// Replace Daraja Token Function
server = server.replace(/const getDarajaToken = async \(\) => \{[\s\S]*?^\s*\};\n/m, '');

// Replace STK push and callback
const stkPushRegex = /apiRouter\.post\('\/payments\/stkpush',[\s\S]*?apiRouter\.post\('\/payments\/callback',[\s\S]*?\}\);/m;

const paystackCode = `
  apiRouter.post('/payments/paystack/verify', authenticateToken, async (req, res) => {
    try {
      const { reference } = req.body;
      const userId = req.user.id;
      
      const response = await fetch(\`https://api.paystack.co/transaction/verify/\${reference}\`, {
        headers: {
          Authorization: \`Bearer \${process.env.PAYSTACK_SECRET_KEY}\`
        }
      });
      
      const data = await response.json();
      
      if (data.status && data.data.status === 'success') {
        const amount = data.data.amount / 100; // Paystack returns amount in kobo/cents
        
        // Check if payment already recorded
        const { data: existing } = await getSupabase().from('Payment')
          .select('*')
          .eq('reference', reference)
          .maybeSingle();
          
        if (!existing) {
          const { data: payment } = await getSupabase().from('Payment').insert({
            amount,
            reference,
            userId,
            status: 'COMPLETED',
            phoneNumber: data.data.customer.phone || '',
            merchantRequestId: data.data.id.toString(),
            checkoutRequestId: data.data.channel
          }).select('*, user:User(name, avatarUrl)').single();
          
          io.emit('new-payment', payment);
          
          await getSupabase().from('Notification').insert({
             title: 'Payment Received',
             message: \`Your contribution of KES \${amount} was received successfully.\`,
             userId
          });
          
          return res.json({ success: true, payment });
        } else {
          return res.json({ success: true, payment: existing, message: 'Already verified' });
        }
      } else {
        res.status(400).json({ error: 'Payment verification failed' });
      }
    } catch (error) {
      console.error('Verify error:', error);
      res.status(500).json({ error: error.message || 'Server error' });
    }
  });

  apiRouter.post('/payments/paystack/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    try {
      const secret = process.env.PAYSTACK_SECRET_KEY;
      const hash = crypto.createHmac('sha512', secret).update(JSON.stringify(req.body)).digest('hex');
      
      if (hash === req.headers['x-paystack-signature']) {
        const event = req.body;
        
        if (event.event === 'charge.success') {
          const reference = event.data.reference;
          const amount = event.data.amount / 100;
          const email = event.data.customer.email;
          
          // Find user by email
          const { data: user } = await getSupabase().from('User').select('id').eq('email', email).maybeSingle();
          
          if (user) {
            const { data: existing } = await getSupabase().from('Payment')
              .select('*')
              .eq('reference', reference)
              .maybeSingle();
              
            if (!existing) {
              const { data: payment } = await getSupabase().from('Payment').insert({
                amount,
                reference,
                userId: user.id,
                status: 'COMPLETED',
                phoneNumber: event.data.customer.phone || '',
                merchantRequestId: event.data.id.toString(),
                checkoutRequestId: event.data.channel
              }).select('*, user:User(name, avatarUrl)').single();
              
              io.emit('new-payment', payment);
              
              await getSupabase().from('Notification').insert({
                 title: 'Payment Received',
                 message: \`Your contribution of KES \${amount} was received successfully.\`,
                 userId: user.id
              });
            }
          }
        }
      }
      res.sendStatus(200);
    } catch (error) {
      console.error('Webhook error:', error);
      res.sendStatus(500);
    }
  });
`;

server = server.replace(stkPushRegex, paystackCode);

// Update config endpoint
server = server.replace(
  "supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,\n      paystackPublicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || process.env.VITE_PAYSTACK_PUBLIC_KEY"
);

fs.writeFileSync('server.ts', server);
console.log('Replaced backend payment handlers with Paystack');

