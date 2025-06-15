
-- Drop the problematic trigger that's causing the errors
DROP TRIGGER IF EXISTS update_pattern_updated_at_trigger ON project_rows;

-- Drop the problematic function that references non-existent 'patterns' table
DROP FUNCTION IF EXISTS public.update_pattern_updated_at();

-- Create the correct function that updates the 'projects' table
CREATE OR REPLACE FUNCTION public.update_project_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    UPDATE projects 
    SET updated_at = now() 
    WHERE id = COALESCE(NEW.project_id, OLD.project_id);
    RETURN COALESCE(NEW, OLD);
END;
$function$;

-- Create the correct trigger that uses the new function
CREATE TRIGGER update_project_updated_at_trigger
    AFTER INSERT OR DELETE OR UPDATE ON project_rows 
    FOR EACH ROW 
    EXECUTE FUNCTION update_project_updated_at();
