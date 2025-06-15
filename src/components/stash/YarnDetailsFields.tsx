
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { YARN_WEIGHTS } from '@/utils/yarnWeights';

interface YarnDetailsFieldsProps {
  formData: {
    weight: string;
    material: string;
    yardage: string;
    remaining_yardage: string;
  };
  onChange: (field: string, value: string) => void;
}

export const YarnDetailsFields = ({ formData, onChange }: YarnDetailsFieldsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <Label htmlFor="weight">Weight</Label>
        <Select value={formData.weight} onValueChange={(value) => onChange('weight', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select yarn weight" />
          </SelectTrigger>
          <SelectContent>
            {YARN_WEIGHTS.map((weight) => (
              <SelectItem key={weight.value} value={weight.value}>
                {weight.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="material">Material</Label>
        <Input
          id="material"
          value={formData.material}
          onChange={(e) => onChange('material', e.target.value)}
          placeholder="e.g., 100% Cotton"
        />
      </div>

      <div>
        <Label htmlFor="yardage">Total Yardage</Label>
        <Input
          id="yardage"
          type="number"
          value={formData.yardage}
          onChange={(e) => onChange('yardage', e.target.value)}
          placeholder="Enter total yards"
        />
      </div>

      <div>
        <Label htmlFor="remaining_yardage">Remaining Yardage</Label>
        <Input
          id="remaining_yardage"
          type="number"
          value={formData.remaining_yardage}
          onChange={(e) => onChange('remaining_yardage', e.target.value)}
          placeholder="Enter remaining yards"
        />
      </div>
    </div>
  );
};
