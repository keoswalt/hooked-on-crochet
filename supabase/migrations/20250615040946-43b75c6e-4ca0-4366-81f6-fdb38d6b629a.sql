
-- Phase 1: Database Schema Changes - Rename Projects to Patterns (Fixed)

-- First, rename the main projects table to patterns
ALTER TABLE public.projects RENAME TO patterns;

-- Rename project_rows table to pattern_rows
ALTER TABLE public.project_rows RENAME TO pattern_rows;

-- Rename project_tags table to pattern_tags
ALTER TABLE public.project_tags RENAME TO pattern_tags;

-- Update column names in pattern_rows table
ALTER TABLE public.pattern_rows RENAME COLUMN project_id TO pattern_id;

-- Update column names in pattern_tags table
ALTER TABLE public.pattern_tags RENAME COLUMN project_id TO pattern_id;

-- Drop existing triggers first to avoid dependency issues
DROP TRIGGER IF EXISTS update_project_on_row_change ON public.pattern_rows;
DROP TRIGGER IF EXISTS update_project_updated_at_trigger ON public.pattern_rows;
DROP TRIGGER IF EXISTS ensure_single_in_progress_trigger ON public.pattern_rows;

-- Now we can safely drop the old functions
DROP FUNCTION IF EXISTS public.update_project_updated_at() CASCADE;
DROP FUNCTION IF EXISTS public.ensure_single_in_progress() CASCADE;

-- Create the new pattern-specific function
CREATE OR REPLACE FUNCTION public.update_pattern_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
    UPDATE patterns 
    SET updated_at = now() 
    WHERE id = COALESCE(NEW.pattern_id, OLD.pattern_id);
    RETURN COALESCE(NEW, OLD);
END;
$function$;

-- Create the new ensure_single_in_progress function
CREATE OR REPLACE FUNCTION public.ensure_single_in_progress()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
    -- If setting a row to in_progress, set all other rows in the same pattern to not in_progress
    IF NEW.make_mode_status = 'in_progress' AND (OLD IS NULL OR OLD.make_mode_status != 'in_progress') THEN
        UPDATE pattern_rows 
        SET make_mode_status = CASE 
            WHEN make_mode_status = 'in_progress' THEN 'not_started'
            ELSE make_mode_status 
        END
        WHERE pattern_id = NEW.pattern_id AND id != NEW.id;
    END IF;
    
    RETURN NEW;
END;
$function$;

-- Create new triggers with proper names
CREATE TRIGGER update_pattern_updated_at_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.pattern_rows
    FOR EACH ROW EXECUTE FUNCTION public.update_pattern_updated_at();

CREATE TRIGGER ensure_single_in_progress_trigger
    BEFORE INSERT OR UPDATE ON public.pattern_rows
    FOR EACH ROW EXECUTE FUNCTION public.ensure_single_in_progress();

-- Update foreign key constraint names and references in pattern_rows
ALTER TABLE public.pattern_rows DROP CONSTRAINT IF EXISTS project_rows_project_id_fkey;
ALTER TABLE public.pattern_rows ADD CONSTRAINT pattern_rows_pattern_id_fkey 
  FOREIGN KEY (pattern_id) REFERENCES public.patterns(id);

-- Update foreign key constraint names in pattern_tags
ALTER TABLE public.pattern_tags DROP CONSTRAINT IF EXISTS fk_project_tags_project_id;
ALTER TABLE public.pattern_tags ADD CONSTRAINT fk_pattern_tags_pattern_id 
  FOREIGN KEY (pattern_id) REFERENCES public.patterns(id);
