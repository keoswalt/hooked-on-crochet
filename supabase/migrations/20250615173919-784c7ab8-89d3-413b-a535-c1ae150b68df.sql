
-- Add 'position' column to plan_images table to support manual ordering
ALTER TABLE public.plan_images ADD COLUMN position integer;

-- Update all existing rows to set their position based on current ordering:
-- is_featured DESC, uploaded_at ASC (to keep prior "featured" then oldest → newest order)
WITH ordered_images AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY plan_id
      ORDER BY COALESCE(is_featured, FALSE) DESC, uploaded_at ASC, id
    ) AS row_num
  FROM public.plan_images
)
UPDATE public.plan_images
SET position = ordered_images.row_num
FROM ordered_images
WHERE public.plan_images.id = ordered_images.id;

-- Make 'position' not null with a default going forward
ALTER TABLE public.plan_images ALTER COLUMN position SET NOT NULL;
ALTER TABLE public.plan_images ALTER COLUMN position SET DEFAULT 1;

-- Add an index for performance on ordering by plan_id/position
CREATE INDEX plan_images_plan_id_position_idx ON public.plan_images (plan_id, position);

-- In future, you may want to drop the is_featured column after refactor:
-- ALTER TABLE public.plan_images DROP COLUMN is_featured;
