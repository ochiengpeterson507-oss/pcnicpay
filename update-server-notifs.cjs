const fs = require('fs');
let server = fs.readFileSync('server.ts', 'utf8');

const notifApiCode = `
  apiRouter.get('/notifications', authenticateToken, async (req, res) => {
    try {
      const { data, error } = await getSupabase().from('Notification')
        .select('*')
        .eq('userId', req.user.id)
        .order('createdAt', { ascending: false });
      if (error) throw error;
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  apiRouter.put('/notifications/:id/read', authenticateToken, async (req, res) => {
    try {
      const { data, error } = await getSupabase().from('Notification')
        .update({ read: true })
        .eq('id', req.params.id)
        .eq('userId', req.user.id)
        .select();
      if (error) throw error;
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
`;

server = server.replace("app.use('/api', apiRouter);", notifApiCode + "\n  app.use('/api', apiRouter);");

// Also add a system notification trigger inside the callback when payment succeeds
const notifTrigger = `
          // Broadcast real-time event
          io.emit('new-payment', payment);

          // Add notification for the user
          await getSupabase().from('Notification').insert({
             title: 'Payment Received',
             message: \`Your contribution of KES \${amount} was received successfully.\`,
             userId: attempt.userId
          });
`;

server = server.replace("// Broadcast real-time event\n          io.emit('new-payment', payment);", notifTrigger);

fs.writeFileSync('server.ts', server);
console.log("Updated server.ts with Notification routes");
