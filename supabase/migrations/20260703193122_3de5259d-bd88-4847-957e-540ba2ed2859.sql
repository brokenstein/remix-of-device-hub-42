-- Allow public read access to device-images bucket
CREATE POLICY "Allow public read access on device-images"
ON storage.objects FOR SELECT
USING (bucket_id = 'device-images');

-- Allow authenticated users to upload to device-images
CREATE POLICY "Allow authenticated uploads to device-images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'device-images');
