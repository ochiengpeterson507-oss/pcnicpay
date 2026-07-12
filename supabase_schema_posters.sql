CREATE TABLE IF NOT EXISTS "Poster" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "title" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Poster_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "Poster" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view all posters" ON "Poster" FOR SELECT USING (true);
