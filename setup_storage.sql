INSERT INTO storage.buckets (id, name, public) VALUES ('gallery', 'gallery', true) ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Gallery items are publicly accessible." ON storage.objects;
CREATE POLICY "Gallery items are publicly accessible." ON storage.objects FOR SELECT USING (bucket_id = 'gallery');

DROP POLICY IF EXISTS "Admins can upload gallery images." ON storage.objects;
CREATE POLICY "Admins can upload gallery images." ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'gallery' AND 
    EXISTS (SELECT 1 FROM public."User" WHERE id = auth.uid() AND role = 'ADMIN')
);

DROP POLICY IF EXISTS "Admins can delete gallery images." ON storage.objects;
CREATE POLICY "Admins can delete gallery images." ON storage.objects FOR DELETE USING (
    bucket_id = 'gallery' AND 
    EXISTS (SELECT 1 FROM public."User" WHERE id = auth.uid() AND role = 'ADMIN')
);
