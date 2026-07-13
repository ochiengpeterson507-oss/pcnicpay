const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const oldNotifyWeb = `await getSupabase().from('Notification').insert({ 
                 title: 'Payment Received', 
                 message: \`Your contribution of \${event.data.currency || 'KES'} \${amount} was received successfully.\`, 
                 userId: user.id
              });`;

const newNotifyWeb = `await getSupabase().from('Notification').insert({ 
                 title: 'Payment Received', 
                 message: \`Your contribution of \${event.data.currency || 'KES'} \${amount} was received successfully.\`, 
                 userId: user.id
              });
              
              const { data: admins } = await getSupabase().from('User').select('id').eq('role', 'ADMIN');
              if (admins && admins.length > 0) {
                const adminNotifications = admins.map(admin => ({
                  title: 'New Contribution',
                  message: \`A new contribution of \${event.data.currency || 'KES'} \${amount} was received.\`,
                  userId: admin.id
                }));
                await getSupabase().from('Notification').insert(adminNotifications);
              }`;

code = code.replace(oldNotifyWeb, newNotifyWeb);
fs.writeFileSync('server.ts', code);
