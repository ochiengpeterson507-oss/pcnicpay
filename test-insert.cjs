const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const id = crypto.randomUUID();
  const { data, error } = await supabase.from('User').insert({
    id,
    email: 'test3@example.com',
    passwordHash: 'hash',
    name: 'Test',
    role: 'MEMBER'
  }).select();
  console.log(error || data);
}
run();
