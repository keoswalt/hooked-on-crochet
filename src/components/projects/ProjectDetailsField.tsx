
import { Label } from '@/components/ui/label';

interface FormData {
  name: string;
  hook_size: string;
  yarn_weight: string;
  details: string;
  featured_image_url: string | null;
}

interface ProjectDetailsFieldProps {
  formData: FormData;
  onFormDataChange: (data: FormData) => void;
}

export const ProjectDetailsField = ({ formData, onFormDataChange }: ProjectDetailsFieldProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="details">Details</Label>
      <textarea
        id="details"
        value={formData.details}
        onChange={(e) => onFormDataChange({ ...formData, details: e.target.value })}
        className="w-full p-2 border rounded-md min-h-[100px] resize-none"
        placeholder="Add project details, notes, or pattern information..."
      />
    </div>
  );
};
