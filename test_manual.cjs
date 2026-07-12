require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data: users } = await supabase.from('User').select('id').limit(1);
  if (!users || users.length === 0) { console.log('No users found'); return; }
  const userId = users[0].id;
  
  const { data, error } = await supabase.from('Payment').insert({
    user_id: userId, amount: 1500, payment_reference: 'TEST-333', payment_status: 'COMPLETED', phoneNumber: 'Manual'
  }).select('*').single();
  
  if (error) console.error(error);
  else {
      console.log('Success insert:', data);
      
      const res = await fetch(`http://127.0.0.1:3000/api/payments`, {
          // just checking if endpoint works, though it requires token... wait, it doesn't require token for get?
          // wait, apiRouter.get('/payments') does not have authenticateToken middleware.
      });
      const payments = await res.json();
      console.log('Fetched via API:', payments.length, payments[0]);
  }
}
test();
