const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const oldNotify = `await getSupabase().from('Notification').insert({ 
            title: 'Payment Received', 
            message: \`Your contribution of \${data.data.currency || 'KES'} \${amount} was received successfully.\`, 
            userId: userId
          });`;

const newNotify = `await getSupabase().from('Notification').insert({ 
            title: 'Payment Received', 
            message: \`Your contribution of \${data.data.currency || 'KES'} \${amount} was received successfully.\`, 
            userId: userId
          });
          
          // Notify the treasurer (ADMINs)
          const { data: admins } = await getSupabase().from('User').select('id').eq('role', 'ADMIN');
          if (admins && admins.length > 0) {
            const adminNotifications = admins.map(admin => ({
              title: 'New Contribution',
              message: \`A new contribution of \${data.data.currency || 'KES'} \${amount} was received.\`,
              userId: admin.id
            }));
            await getSupabase().from('Notification').insert(adminNotifications);
          }`;

code = code.replace(oldNotify, newNotify);
fs.writeFileSync('server.ts', code);
