const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase.from('Payment').insert({
    amount: 100,
    reference: 'REF-123',
    userId: '172bac3d-9d56-4165-a373-2df816d52a5a',
    status: 'COMPLETED'
  }).select();
  console.log(error || data);
}
run();
