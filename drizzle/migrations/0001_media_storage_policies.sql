CREATE POLICY "Anyone can view site media" ON storage.objects
  FOR SELECT TO anon, authenticated USING (bucket_id = 'media');
CREATE POLICY "Owner can upload site media" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'media' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Owner can update site media" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'media' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Owner can delete site media" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'media' AND public.has_role(auth.uid(), 'admin'));
