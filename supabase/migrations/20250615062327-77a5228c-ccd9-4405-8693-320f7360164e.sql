
-- Rename planner_projects table to plans
ALTER TABLE public.planner_projects RENAME TO plans;

-- Rename the foreign key column in canvas_elements table
ALTER TABLE public.canvas_elements RENAME COLUMN planner_project_id TO plan_id;

-- Update the foreign key constraint name to match the new naming
ALTER TABLE public.canvas_elements DROP CONSTRAINT canvas_elements_planner_project_id_fkey;
ALTER TABLE public.canvas_elements ADD CONSTRAINT canvas_elements_plan_id_fkey 
  FOREIGN KEY (plan_id) REFERENCES public.plans(id) ON DELETE CASCADE;

-- Update RLS policy names to reflect the new table name
DROP POLICY IF EXISTS "Users can view their own planner projects" ON public.plans;
DROP POLICY IF EXISTS "Users can create their own planner projects" ON public.plans;
DROP POLICY IF EXISTS "Users can update their own planner projects" ON public.plans;
DROP POLICY IF EXISTS "Users can delete their own planner projects" ON public.plans;

CREATE POLICY "Users can view their own plans" 
  ON public.plans 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own plans" 
  ON public.plans 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own plans" 
  ON public.plans 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own plans" 
  ON public.plans 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Update RLS policy for canvas_elements to reference the new foreign key
DROP POLICY IF EXISTS "Users can view elements of their own planner projects" ON public.canvas_elements;
DROP POLICY IF EXISTS "Users can create elements in their own planner projects" ON public.canvas_elements;
DROP POLICY IF EXISTS "Users can update elements in their own planner projects" ON public.canvas_elements;
DROP POLICY IF EXISTS "Users can delete elements in their own planner projects" ON public.canvas_elements;

CREATE POLICY "Users can view elements of their own plans" 
  ON public.canvas_elements 
  FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.plans WHERE plans.id = canvas_elements.plan_id AND plans.user_id = auth.uid()));

CREATE POLICY "Users can create elements in their own plans" 
  ON public.canvas_elements 
  FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.plans WHERE plans.id = canvas_elements.plan_id AND plans.user_id = auth.uid()));

CREATE POLICY "Users can update elements in their own plans" 
  ON public.canvas_elements 
  FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM public.plans WHERE plans.id = canvas_elements.plan_id AND plans.user_id = auth.uid()));

CREATE POLICY "Users can delete elements in their own plans" 
  ON public.canvas_elements 
  FOR DELETE 
  USING (EXISTS (SELECT 1 FROM public.plans WHERE plans.id = canvas_elements.plan_id AND plans.user_id = auth.uid()));

-- Update the trigger name to match the new table name
DROP TRIGGER IF EXISTS update_planner_projects_updated_at ON public.plans;
CREATE TRIGGER update_plans_updated_at
  BEFORE UPDATE ON public.plans
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
