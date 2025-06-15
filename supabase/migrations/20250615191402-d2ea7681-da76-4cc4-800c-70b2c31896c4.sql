
-- Create the plan_project_attachments table to link projects to plans for a specific user

CREATE TABLE public.plan_project_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id uuid NOT NULL,
  project_id uuid NOT NULL,
  user_id uuid NOT NULL,
  attached_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT fk_plan FOREIGN KEY (plan_id) REFERENCES public.plans(id) ON DELETE CASCADE,
  CONSTRAINT fk_project FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE
);

-- Enable Row Level Security (RLS) on the table
ALTER TABLE public.plan_project_attachments ENABLE ROW LEVEL SECURITY;

-- Allow users to SELECT their own plan_project_attachments
CREATE POLICY "Users can view their plan_project_attachments"
  ON public.plan_project_attachments
  FOR SELECT
  USING (user_id = auth.uid());

-- Allow users to INSERT their own plan_project_attachments
CREATE POLICY "Users can attach projects to their own plans"
  ON public.plan_project_attachments
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Allow users to UPDATE their own plan_project_attachments (may not be needed but included for completeness)
CREATE POLICY "Users can update their own plan_project_attachments"
  ON public.plan_project_attachments
  FOR UPDATE
  USING (user_id = auth.uid());

-- Allow users to DELETE their own plan_project_attachments
CREATE POLICY "Users can detach projects from their own plans"
  ON public.plan_project_attachments
  FOR DELETE
  USING (user_id = auth.uid());

-- Optionally create an index for quick lookups
CREATE INDEX idx_plan_project_attachments_by_plan ON public.plan_project_attachments(plan_id);

