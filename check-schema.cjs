const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: { openapi } } = await supabase.from('User').select('*').limit(1);
  // Actually we just want to know tables
  const { data: tables } = await supabase.rpc('get_tables');
  console.log(tables);
}
run();
