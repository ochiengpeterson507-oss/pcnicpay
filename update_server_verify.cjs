const fs = require('fs');

let server = fs.readFileSync('server.ts', 'utf8');

const newVerifyCode = `
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
        const amount = data.data.amount / 100;
        
        // Check if payment already recorded using the new schema
        const { data: existing } = await getSupabase().from('Payment')
          .select('*')
          .eq('payment_reference', reference)
          .maybeSingle();
          
        if (!existing) {
          const { data: payment } = await getSupabase().from('Payment').insert({
            amount,
            currency: data.data.currency || 'KES',
            payment_reference: reference,
            user_id: userId,
            payment_status: 'COMPLETED',
            paystack_transaction_id: data.data.id.toString(),
            payment_method: data.data.channel,
            payment_channel: data.data.channel,
            paid_at: data.data.paid_at || new Date().toISOString()
          }).select('*, user:User(name, avatarUrl)').single();
          
          io.emit('new-payment', payment);
          
          await getSupabase().from('Notification').insert({
             title: 'Payment Received',
             message: \`Your contribution of \${data.data.currency || 'KES'} \${amount} was received successfully.\`,
             userId: userId // assuming Notification table still uses userId
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
`;

server = server.replace(/apiRouter\.post\('\/payments\/paystack\/verify',[\s\S]*?\}\);/m, newVerifyCode);

// I'll also remove the paystack/webhook from server.ts because we are using an edge function for it now,
// but actually, wait. If we run this app locally, edge functions aren't running natively via `node server.ts`.
// I will keep the express webhook as well, but update it to use the new schema, just to be safe.

const newWebhookCode = `
  apiRouter.post('/payments/paystack/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    try {
      const secret = process.env.PAYSTACK_SECRET_KEY;
      const hash = crypto.createHmac('sha512', secret).update(JSON.stringify(req.body)).digest('hex');
      
      if (hash === req.headers['x-paystack-signature']) {
        const event = req.body;
        
        await getSupabase().from('payment_webhooks').insert({
          event_type: event.event,
          event_data: event
        });
        
        if (event.event === 'charge.success') {
          const reference = event.data.reference;
          const amount = event.data.amount / 100;
          const email = event.data.customer.email;
          
          const { data: user } = await getSupabase().from('User').select('id').eq('email', email).maybeSingle();
          
          if (user) {
            const { data: existing } = await getSupabase().from('Payment')
              .select('*')
              .eq('payment_reference', reference)
              .maybeSingle();
              
            if (!existing) {
              const { data: payment } = await getSupabase().from('Payment').insert({
                amount,
                currency: event.data.currency || 'KES',
                payment_reference: reference,
                user_id: user.id,
                payment_status: 'COMPLETED',
                paystack_transaction_id: event.data.id.toString(),
                payment_method: event.data.channel,
                payment_channel: event.data.channel,
                paid_at: event.data.paid_at || new Date().toISOString()
              }).select('*, user:User(name, avatarUrl)').single();
              
              io.emit('new-payment', payment);
              
              await getSupabase().from('Notification').insert({
                 title: 'Payment Received',
                 message: \`Your contribution of \${event.data.currency || 'KES'} \${amount} was received successfully.\`,
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

server = server.replace(/apiRouter\.post\('\/payments\/paystack\/webhook',[\s\S]*?\}\);/m, newWebhookCode);

fs.writeFileSync('server.ts', server);
console.log('Updated server verify and webhook endpoints to new schema.');
