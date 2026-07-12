require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function test() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/`, {
    headers: { 'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY }
  });
  const openapi = await res.json();
  console.log(Object.keys(openapi.definitions.Payment.properties));
}
test();
