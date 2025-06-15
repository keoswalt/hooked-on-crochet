
-- PLAN IMAGES TABLE
CREATE TABLE public.plan_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES public.plans(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  is_featured BOOLEAN DEFAULT FALSE,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  user_id UUID NOT NULL
);

-- Create partial unique index for featured images (only one featured image per plan)
CREATE UNIQUE INDEX unique_featured_per_plan 
ON public.plan_images (plan_id) 
WHERE (is_featured IS TRUE);

ALTER TABLE public.plan_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own plan images"
  ON public.plan_images
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own plan images"
  ON public.plan_images
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own plan images"
  ON public.plan_images
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own plan images"
  ON public.plan_images
  FOR DELETE
  USING (auth.uid() = user_id);

-- PLAN RESOURCES TABLE
CREATE TABLE public.plan_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES public.plans(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  title TEXT,
  description TEXT,
  resource_type TEXT,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.plan_resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own plan resources"
  ON public.plan_resources
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own plan resources"
  ON public.plan_resources
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own plan resources"
  ON public.plan_resources
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own plan resources"
  ON public.plan_resources
  FOR DELETE
  USING (auth.uid() = user_id);

-- PLAN YARN ATTACHMENTS TABLE
CREATE TABLE public.plan_yarn_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES public.plans(id) ON DELETE CASCADE,
  yarn_id UUID NOT NULL REFERENCES public.yarn_stash(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  attached_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (plan_id, yarn_id)
);

ALTER TABLE public.plan_yarn_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own plan yarn attachments"
  ON public.plan_yarn_attachments
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own plan yarn attachments"
  ON public.plan_yarn_attachments
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own plan yarn attachments"
  ON public.plan_yarn_attachments
  FOR DELETE
  USING (auth.uid() = user_id);

-- PLAN SWATCH ATTACHMENTS TABLE
CREATE TABLE public.plan_swatch_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES public.plans(id) ON DELETE CASCADE,
  swatch_id UUID NOT NULL REFERENCES public.swatches(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  attached_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (plan_id, swatch_id)
);

ALTER TABLE public.plan_swatch_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own plan swatch attachments"
  ON public.plan_swatch_attachments
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own plan swatch attachments"
  ON public.plan_swatch_attachments
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own plan swatch attachments"
  ON public.plan_swatch_attachments
  FOR DELETE
  USING (auth.uid() = user_id);
