-- Announcements Table
CREATE TABLE IF NOT EXISTS "Announcement" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
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

DROP POLICY IF EXISTS "Admins can delete announcements" ON "Announcement";
CREATE POLICY "Admins can delete announcements" ON "Announcement" FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM "User" WHERE id = auth.uid() AND role = 'ADMIN'
  )
);

DROP POLICY IF EXISTS "Admins can update announcements" ON "Announcement";
CREATE POLICY "Admins can update announcements" ON "Announcement" FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM "User" WHERE id = auth.uid() AND role = 'ADMIN'
  )
);

-- Gallery Table
CREATE TABLE IF NOT EXISTS "Gallery" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "title" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT NOT NULL,
    "uploaded_by" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Gallery_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "Gallery" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view all gallery items" ON "Gallery";
CREATE POLICY "Users can view all gallery items" ON "Gallery" FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can insert gallery items" ON "Gallery";
CREATE POLICY "Admins can insert gallery items" ON "Gallery" FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM "User" WHERE id = auth.uid() AND role = 'ADMIN'
  )
);

DROP POLICY IF EXISTS "Admins can delete gallery items" ON "Gallery";
CREATE POLICY "Admins can delete gallery items" ON "Gallery" FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM "User" WHERE id = auth.uid() AND role = 'ADMIN'
  )
);
