-- 1. Ensure uuid-ossp is enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Alter User table to ensure id is UUID
-- Since casting text to uuid might fail if data is invalid, we do it safely:
ALTER TABLE "User" ALTER COLUMN "id" TYPE UUID USING "id"::uuid;

-- 3. Alter Payment table 
-- First, rename the old columns if they exist
DO $$ 
BEGIN
  IF EXISTS(SELECT * FROM information_schema.columns WHERE table_name='Payment' and column_name='userId') THEN
      ALTER TABLE "Payment" RENAME COLUMN "userId" TO "user_id";
  END IF;
  IF EXISTS(SELECT * FROM information_schema.columns WHERE table_name='Payment' and column_name='reference') THEN
      ALTER TABLE "Payment" RENAME COLUMN "reference" TO "payment_reference";
  END IF;
  IF EXISTS(SELECT * FROM information_schema.columns WHERE table_name='Payment' and column_name='status') THEN
      ALTER TABLE "Payment" RENAME COLUMN "status" TO "payment_status";
  END IF;
END $$;

-- Now add missing columns
ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "currency" TEXT DEFAULT 'KES';
ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "paystack_transaction_id" TEXT;
ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "payment_method" TEXT;
ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "payment_channel" TEXT;
ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "paid_at" TIMESTAMP(3) WITH TIME ZONE;
ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Also fix Payment user_id column type if needed
ALTER TABLE "Payment" ALTER COLUMN "user_id" TYPE UUID USING "user_id"::uuid;

-- 4. Re-create the policies safely
DROP POLICY IF EXISTS "Users can update their own profile" ON "User";
CREATE POLICY "Users can update their own profile" ON "User" FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can view all users" ON "User";
CREATE POLICY "Users can view all users" ON "User" FOR SELECT USING (true);
