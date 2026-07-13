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
