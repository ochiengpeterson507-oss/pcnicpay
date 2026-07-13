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
CREATE INDEX IF NOT EXISTS "idx_payment_user_id" ON "Payment"("user_id");
CREATE INDEX IF NOT EXISTS "idx_payment_date" ON "Payment"("date" DESC);
CREATE INDEX IF NOT EXISTS "idx_expense_date" ON "Expense"("date" DESC);
CREATE INDEX IF NOT EXISTS "idx_announcement_date" ON "Announcement"("created_at" DESC);
CREATE INDEX IF NOT EXISTS "idx_gallery_date" ON "Gallery"("created_at" DESC);
CREATE INDEX IF NOT EXISTS "idx_notification_user_id" ON "Notification"("userId");

-- Enable RLS on all tables
ALTER TABLE "Payment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Expense" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Announcement" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Gallery" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Notification" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;

-- Payment RLS
DROP POLICY IF EXISTS "Users can view their own payments" ON "Payment";
CREATE POLICY "Users can view their own payments" ON "Payment" FOR SELECT USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM "User" WHERE id = auth.uid() AND role = 'ADMIN'));

DROP POLICY IF EXISTS "Admins can view all payments" ON "Payment";
CREATE POLICY "Admins can view all payments" ON "Payment" FOR SELECT USING (EXISTS (SELECT 1 FROM "User" WHERE id = auth.uid() AND role = 'ADMIN'));

-- Expense RLS
DROP POLICY IF EXISTS "Anyone can view expenses" ON "Expense";
CREATE POLICY "Anyone can view expenses" ON "Expense" FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage expenses" ON "Expense";
CREATE POLICY "Admins can manage expenses" ON "Expense" USING (EXISTS (SELECT 1 FROM "User" WHERE id = auth.uid() AND role = 'ADMIN'));

-- Announcement RLS
DROP POLICY IF EXISTS "Anyone can view announcements" ON "Announcement";
CREATE POLICY "Anyone can view announcements" ON "Announcement" FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage announcements" ON "Announcement";
CREATE POLICY "Admins can manage announcements" ON "Announcement" USING (EXISTS (SELECT 1 FROM "User" WHERE id = auth.uid() AND role = 'ADMIN'));

-- Gallery RLS
DROP POLICY IF EXISTS "Anyone can view gallery" ON "Gallery";
CREATE POLICY "Anyone can view gallery" ON "Gallery" FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage gallery" ON "Gallery";
CREATE POLICY "Admins can manage gallery" ON "Gallery" USING (EXISTS (SELECT 1 FROM "User" WHERE id = auth.uid() AND role = 'ADMIN'));

-- Notification RLS
DROP POLICY IF EXISTS "Users can view their own notifications" ON "Notification";
CREATE POLICY "Users can view their own notifications" ON "Notification" FOR SELECT USING (auth.uid() = "userId");

DROP POLICY IF EXISTS "Users can update their own notifications" ON "Notification";
CREATE POLICY "Users can update their own notifications" ON "Notification" FOR UPDATE USING (auth.uid() = "userId");
CREATE TABLE IF NOT EXISTS "ContributionBalance" (
    "id" TEXT NOT NULL DEFAULT 'main',
    "total_collected" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total_expenses" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ContributionBalance_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "payment_webhooks" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "event_type" TEXT NOT NULL,
    "event_data" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "payment_webhooks_pkey" PRIMARY KEY ("id")
);

-- Enable RLS
ALTER TABLE "ContributionBalance" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "payment_webhooks" ENABLE ROW LEVEL SECURITY;

-- ContributionBalance Policies
DROP POLICY IF EXISTS "Anyone can view contribution balance" ON "ContributionBalance";
CREATE POLICY "Anyone can view contribution balance" ON "ContributionBalance" FOR SELECT USING (true);

-- Webhooks Policies
DROP POLICY IF EXISTS "Admins can view webhooks" ON "payment_webhooks";
CREATE POLICY "Admins can view webhooks" ON "payment_webhooks" FOR SELECT USING (EXISTS (SELECT 1 FROM "User" WHERE id = auth.uid() AND role = 'ADMIN'));
