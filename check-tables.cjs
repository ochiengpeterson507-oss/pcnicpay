const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("Expense:", await supabase.from('Expense').select('id').limit(1));
  console.log("Notification:", await supabase.from('Notification').select('id').limit(1));
}
run();
