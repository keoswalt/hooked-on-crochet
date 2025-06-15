
-- Drop the problematic trigger that references the old pattern_rows table
DROP TRIGGER IF EXISTS ensure_single_in_progress_trigger ON project_rows;

-- Update the function to use the correct table and column names
CREATE OR REPLACE FUNCTION public.ensure_single_in_progress()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    -- If setting a row to in_progress, set all other rows in the same project to not in_progress
    IF NEW.make_mode_status = 'in_progress' AND (OLD IS NULL OR OLD.make_mode_status != 'in_progress') THEN
        UPDATE project_rows 
        SET make_mode_status = CASE 
            WHEN make_mode_status = 'in_progress' THEN 'not_started'
            ELSE make_mode_status 
        END
        WHERE project_id = NEW.project_id AND id != NEW.id;
    END IF;
    
    RETURN NEW;
END;
$function$;

-- Recreate the trigger with the corrected function
CREATE TRIGGER ensure_single_in_progress_trigger
    BEFORE INSERT OR UPDATE ON project_rows 
    FOR EACH ROW 
    EXECUTE FUNCTION ensure_single_in_progress();
