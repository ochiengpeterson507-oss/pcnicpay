CREATE TABLE IF NOT EXISTS "Announcement" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "is_published" BOOLEAN NOT NULL DEFAULT true,
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Announcement_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "Announcement" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view all announcements" ON "Announcement";
CREATE POLICY "Users can view all announcements" ON "Announcement" FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins can insert announcements" ON "Announcement";
CREATE POLICY "Admins can insert announcements" ON "Announcement" FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM "User" WHERE id = auth.uid() AND role = 'ADMIN'
  )
);
