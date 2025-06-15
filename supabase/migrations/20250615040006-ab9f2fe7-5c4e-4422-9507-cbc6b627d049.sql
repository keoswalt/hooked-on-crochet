
-- Create yarn stash table
CREATE TABLE public.yarn_stash (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  brand TEXT,
  color TEXT,
  weight TEXT, -- yarn weight like 'DK', 'Worsted', etc
  material TEXT, -- fiber content like 'Cotton', 'Wool', etc
  yardage INTEGER, -- total yards/meters
  remaining_yardage INTEGER, -- remaining yards/meters
  purchase_date DATE,
  cost DECIMAL(10,2),
  notes TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create swatches table
CREATE TABLE public.swatches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  hook_size TEXT,
  yarn_used TEXT, -- references to yarn from stash
  stitches_per_inch DECIMAL(4,2),
  rows_per_inch DECIMAL(4,2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create swatch images table (one-to-many relationship)
CREATE TABLE public.swatch_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  swatch_id UUID NOT NULL REFERENCES public.swatches(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption TEXT,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create planner projects table (separate from pattern projects)
CREATE TABLE public.planner_projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  canvas_data JSONB DEFAULT '{}', -- stores canvas state, zoom, pan, etc
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create canvas elements table
CREATE TABLE public.canvas_elements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  planner_project_id UUID NOT NULL REFERENCES public.planner_projects(id) ON DELETE CASCADE,
  element_type TEXT NOT NULL CHECK (element_type IN ('yarn', 'swatch', 'text', 'image', 'link')),
  position_x DECIMAL(10,2) NOT NULL DEFAULT 0,
  position_y DECIMAL(10,2) NOT NULL DEFAULT 0,
  width DECIMAL(10,2) DEFAULT 200,
  height DECIMAL(10,2) DEFAULT 100,
  rotation DECIMAL(5,2) DEFAULT 0,
  z_index INTEGER DEFAULT 0,
  properties JSONB DEFAULT '{}', -- stores element-specific data
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for yarn_stash
ALTER TABLE public.yarn_stash ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own yarn stash" 
  ON public.yarn_stash 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own yarn entries" 
  ON public.yarn_stash 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own yarn entries" 
  ON public.yarn_stash 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own yarn entries" 
  ON public.yarn_stash 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Add RLS policies for swatches
ALTER TABLE public.swatches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own swatches" 
  ON public.swatches 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own swatches" 
  ON public.swatches 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own swatches" 
  ON public.swatches 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own swatches" 
  ON public.swatches 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Add RLS policies for swatch_images
ALTER TABLE public.swatch_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view images of their own swatches" 
  ON public.swatch_images 
  FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.swatches WHERE swatches.id = swatch_images.swatch_id AND swatches.user_id = auth.uid()));

CREATE POLICY "Users can create images for their own swatches" 
  ON public.swatch_images 
  FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.swatches WHERE swatches.id = swatch_images.swatch_id AND swatches.user_id = auth.uid()));

CREATE POLICY "Users can update images of their own swatches" 
  ON public.swatch_images 
  FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM public.swatches WHERE swatches.id = swatch_images.swatch_id AND swatches.user_id = auth.uid()));

CREATE POLICY "Users can delete images of their own swatches" 
  ON public.swatch_images 
  FOR DELETE 
  USING (EXISTS (SELECT 1 FROM public.swatches WHERE swatches.id = swatch_images.swatch_id AND swatches.user_id = auth.uid()));

-- Add RLS policies for planner_projects
ALTER TABLE public.planner_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own planner projects" 
  ON public.planner_projects 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own planner projects" 
  ON public.planner_projects 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own planner projects" 
  ON public.planner_projects 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own planner projects" 
  ON public.planner_projects 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Add RLS policies for canvas_elements
ALTER TABLE public.canvas_elements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view elements of their own planner projects" 
  ON public.canvas_elements 
  FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.planner_projects WHERE planner_projects.id = canvas_elements.planner_project_id AND planner_projects.user_id = auth.uid()));

CREATE POLICY "Users can create elements in their own planner projects" 
  ON public.canvas_elements 
  FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.planner_projects WHERE planner_projects.id = canvas_elements.planner_project_id AND planner_projects.user_id = auth.uid()));

CREATE POLICY "Users can update elements in their own planner projects" 
  ON public.canvas_elements 
  FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM public.planner_projects WHERE planner_projects.id = canvas_elements.planner_project_id AND planner_projects.user_id = auth.uid()));

CREATE POLICY "Users can delete elements in their own planner projects" 
  ON public.canvas_elements 
  FOR DELETE 
  USING (EXISTS (SELECT 1 FROM public.planner_projects WHERE planner_projects.id = canvas_elements.planner_project_id AND planner_projects.user_id = auth.uid()));

-- Add triggers for updated_at timestamps
CREATE TRIGGER update_yarn_stash_updated_at
  BEFORE UPDATE ON public.yarn_stash
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

CREATE TRIGGER update_swatches_updated_at
  BEFORE UPDATE ON public.swatches
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

CREATE TRIGGER update_planner_projects_updated_at
  BEFORE UPDATE ON public.planner_projects
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

CREATE TRIGGER update_canvas_elements_updated_at
  BEFORE UPDATE ON public.canvas_elements
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
