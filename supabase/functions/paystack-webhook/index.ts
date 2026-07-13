// @ts-nocheck
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";
import * as crypto from "https://deno.land/std@0.177.0/crypto/mod.ts";
import { encode as hexEncode } from "https://deno.land/std@0.177.0/encoding/hex.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const paystackSecretKey = Deno.env.get("PAYSTACK_SECRET_KEY")!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const signature = req.headers.get("x-paystack-signature");
  if (!signature) {
    return new Response("Missing signature", { status: 401 });
  }

  const bodyText = await req.text();
  
  // Verify Paystack signature
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(paystackSecretKey),
    { name: "HMAC", hash: "SHA-512" },
    false,
    ["sign", "verify"]
  );
  
  const signatureBuffer = await crypto.subtle.sign("HMAC", key, encoder.encode(bodyText));
  const hexSignature = new TextDecoder().decode(hexEncode(new Uint8Array(signatureBuffer)));

  if (hexSignature !== signature) {
    return new Response("Invalid signature", { status: 401 });
  }

  const event = JSON.parse(bodyText);

  // Store webhook event for auditing
  await supabase.from("payment_webhooks").insert({
    event_type: event.event,
    event_data: event,
  });

  if (event.event === "charge.success") {
    const data = event.data;
    const amount = data.amount / 100;
    const reference = data.reference;
    const email = data.customer.email;

    // Get user
    const { data: user } = await supabase
      .from("User")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (user) {
      // Prevent duplicate processing
      const { data: existingPayment } = await supabase
        .from("Payment")
        .select("id")
        .eq("payment_reference", reference)
        .maybeSingle();

      if (!existingPayment) {
        // Record payment in transactions table
        const { data: payment, error } = await supabase
          .from("Payment")
          .insert({
            user_id: user.id,
            amount: amount,
            currency: data.currency || "KES",
            payment_reference: reference,
            paystack_transaction_id: data.id.toString(),
            payment_method: data.channel,
            payment_channel: data.channel,
            payment_status: "COMPLETED",
            paid_at: data.paid_at || new Date().toISOString(),
          })
          .select()
          .single();

        if (!error && payment) {
          // Send Notification
          await supabase.from("Notification").insert({
            userId: user.id,
            title: "Payment Received",
            message: `Your contribution of ${data.currency || 'KES'} ${amount} was received successfully.`,
            read: false
          });

          // Update contribution balance table if exists, otherwise recalculate
          // The prompt mentioned "contribution balance tables"
          const { data: balanceRecord } = await supabase
             .from("ContributionBalance")
             .select("*")
             .eq("id", "main")
             .maybeSingle();
             
          if (balanceRecord) {
             await supabase
               .from("ContributionBalance")
               .update({ 
                  total_collected: balanceRecord.total_collected + amount,
                  updated_at: new Date().toISOString()
               })
               .eq("id", "main");
          } else {
             // Create if it doesn't exist
             await supabase
               .from("ContributionBalance")
               .insert({ 
                  id: "main",
                  total_collected: amount,
                  updated_at: new Date().toISOString()
               });
          }

          // Trigger a realtime update by inserting an event into a dummy realtime_events table or similar
          // Wait, just updating Payment and ContributionBalance will trigger postgres changes
          // But we can explicitly notify admins too
          const { data: admins } = await supabase.from('User').select('id').eq('role', 'ADMIN');
          if (admins && admins.length > 0) {
            const adminNotifications = admins.map(admin => ({
              title: 'New Contribution',
              message: `A new contribution of ${data.currency || 'KES'} ${amount} was received.`,
              userId: admin.id
            }));
            await supabase.from('Notification').insert(adminNotifications);
          }
        }
      }
    }
  }

  return new Response(JSON.stringify({ received: true }), { 
    status: 200, 
    headers: { "Content-Type": "application/json" } 
  });
});
