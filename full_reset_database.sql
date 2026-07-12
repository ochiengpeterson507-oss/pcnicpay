-- WARNING: This will drop your existing tables and recreate them.
-- ONLY run this if you don't mind losing the existing data in these tables.

DROP TABLE IF EXISTS "PaymentAttempt" CASCADE;
DROP TABLE IF EXISTS "Payment" CASCADE;
DROP TABLE IF EXISTS "Expense" CASCADE;
DROP TABLE IF EXISTS "Notification" CASCADE;
DROP TABLE IF EXISTS "Poster" CASCADE;
DROP TABLE IF EXISTS "User" CASCADE;
DROP TABLE IF EXISTS "payment_webhooks" CASCADE;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- CreateTable User
CREATE TABLE "User" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'MEMBER',
    "avatarUrl" TEXT,
    "phone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateTable Payment
CREATE TABLE "Payment" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "amount" DOUBLE PRECISION NOT NULL,
    "payment_reference" TEXT NOT NULL,
    "payment_status" TEXT NOT NULL DEFAULT 'COMPLETED',
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" UUID NOT NULL,
    "phoneNumber" TEXT,
    "currency" TEXT DEFAULT 'KES',
    "paystack_transaction_id" TEXT,
    "payment_method" TEXT,
    "payment_channel" TEXT,
    "paid_at" TIMESTAMP(3) WITH TIME ZONE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Payment_reference_key" ON "Payment"("payment_reference");

-- CreateTable Expense
CREATE TABLE "Expense" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "title" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "category" TEXT NOT NULL,
    "receiptUrl" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "recordedById" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Expense_pkey" PRIMARY KEY ("id")
);

-- CreateTable Notification
CREATE TABLE "Notification" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "userId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable Poster
CREATE TABLE "Poster" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "title" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Poster_pkey" PRIMARY KEY ("id")
);

-- Create Webhooks Table
CREATE TABLE "payment_webhooks" (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type text,
  event_data jsonb,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Payment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Expense" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Notification" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Poster" ENABLE ROW LEVEL SECURITY;

-- User Table Policies
CREATE POLICY "Users can view all users" ON "User" FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON "User" FOR UPDATE USING (auth.uid() = id);

-- Payment Table Policies
CREATE POLICY "Users can view all payments" ON "Payment" FOR SELECT USING (true);

-- Expense Table Policies
CREATE POLICY "Users can view all expenses" ON "Expense" FOR SELECT USING (true);

-- Notification Table Policies
CREATE POLICY "Users can view their own notifications" ON "Notification" FOR SELECT USING (true);

-- Poster Table Policies
CREATE POLICY "Users can view all posters" ON "Poster" FOR SELECT USING (true);
