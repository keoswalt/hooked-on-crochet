
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Database } from '@/integrations/supabase/types';

type HookSize = Database['public']['Enums']['hook_size'];
type YarnWeight = Database['public']['Enums']['yarn_weight'];

interface FormData {
  name: string;
  hook_size: HookSize | '';
  yarn_weight: YarnWeight | '';
  details: string;
  featured_image_url: string | null;
}

interface ProjectBasicFieldsProps {
  formData: FormData;
  onFormDataChange: (data: FormData) => void;
}

const hookSizes: HookSize[] = ['2mm', '2.2mm', '3mm', '3.5mm', '4mm', '4.5mm', '5mm', '5.5mm', '6mm', '6.5mm', '9mm', '10mm'];
const yarnWeights: YarnWeight[] = ['0', '1', '2', '3', '4', '5', '6', '7'];

export const ProjectBasicFields = ({ formData, onFormDataChange }: ProjectBasicFieldsProps) => {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="name">Project Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => onFormDataChange({ ...formData, name: e.target.value })}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="hook_size">Hook Size</Label>
        <Select value={formData.hook_size} onValueChange={(value: HookSize) => onFormDataChange({ ...formData, hook_size: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select hook size" />
          </SelectTrigger>
          <SelectContent>
            {hookSizes.map((size) => (
              <SelectItem key={size} value={size}>{size}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="yarn_weight">Yarn Weight</Label>
        <Select value={formData.yarn_weight} onValueChange={(value: YarnWeight) => onFormDataChange({ ...formData, yarn_weight: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select yarn weight" />
          </SelectTrigger>
          <SelectContent>
            {yarnWeights.map((weight) => (
              <SelectItem key={weight} value={weight}>{weight}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </>
  );
};
