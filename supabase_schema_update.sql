-- Run this in your Supabase SQL Editor

-- Update Payment Table
ALTER TABLE "Payment" RENAME COLUMN "userId" TO "user_id";
ALTER TABLE "Payment" RENAME COLUMN "reference" TO "payment_reference";
ALTER TABLE "Payment" RENAME COLUMN "status" TO "payment_status";

ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "currency" text DEFAULT 'KES';
ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "paystack_transaction_id" text;
ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "payment_method" text;
ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "payment_channel" text;
ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "paid_at" timestamp with time zone;
-- Note: 'createdAt' and 'updatedAt' exist or need renaming?
ALTER TABLE "Payment" RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "Payment" RENAME COLUMN "updatedAt" TO "updated_at";

-- Create Webhooks Table
CREATE TABLE IF NOT EXISTS "payment_webhooks" (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type text,
  event_data jsonb,
  created_at timestamp with time zone DEFAULT now()
);

-- Note: You may also need to update Foreign Key references and RLS policies if you rename columns.
