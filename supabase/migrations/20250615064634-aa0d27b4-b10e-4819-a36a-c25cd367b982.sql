
-- Remove cost and purchase_date columns from yarn_stash table
ALTER TABLE public.yarn_stash DROP COLUMN IF EXISTS cost;
ALTER TABLE public.yarn_stash DROP COLUMN IF EXISTS purchase_date;

-- Update weight column to use yarn_weight enum instead of text
ALTER TABLE public.yarn_stash 
ALTER COLUMN weight TYPE yarn_weight 
USING CASE 
  WHEN weight = 'Lace' THEN '0'::yarn_weight
  WHEN weight = 'Light Fingering' THEN '1'::yarn_weight
  WHEN weight = 'Fingering' THEN '2'::yarn_weight
  WHEN weight = 'Sport' THEN '3'::yarn_weight
  WHEN weight = 'DK' THEN '4'::yarn_weight
  WHEN weight = 'Worsted' THEN '5'::yarn_weight
  WHEN weight = 'Chunky' THEN '6'::yarn_weight
  WHEN weight = 'Super Chunky' THEN '7'::yarn_weight
  ELSE NULL
END;

-- Create storage bucket for yarn images
INSERT INTO storage.buckets (id, name, public)
VALUES ('yarn-images', 'yarn-images', true);

-- Create storage policies for yarn images
CREATE POLICY "Users can upload yarn images" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'yarn-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Anyone can view yarn images" ON storage.objects
FOR SELECT USING (bucket_id = 'yarn-images');

CREATE POLICY "Users can update their yarn images" ON storage.objects
FOR UPDATE USING (bucket_id = 'yarn-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their yarn images" ON storage.objects
FOR DELETE USING (bucket_id = 'yarn-images' AND auth.uid()::text = (storage.foldername(name))[1]);
