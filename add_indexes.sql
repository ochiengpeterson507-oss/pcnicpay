CREATE INDEX IF NOT EXISTS "idx_payment_user_id" ON "Payment"("user_id");
CREATE INDEX IF NOT EXISTS "idx_payment_date" ON "Payment"("date" DESC);
CREATE INDEX IF NOT EXISTS "idx_expense_date" ON "Expense"("date" DESC);
CREATE INDEX IF NOT EXISTS "idx_announcement_date" ON "Announcement"("created_at" DESC);
CREATE INDEX IF NOT EXISTS "idx_gallery_date" ON "Gallery"("created_at" DESC);
CREATE INDEX IF NOT EXISTS "idx_notification_user_id" ON "Notification"("userId");
