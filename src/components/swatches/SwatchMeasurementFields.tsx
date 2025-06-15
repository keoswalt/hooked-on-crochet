
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const HOOK_SIZES = [
  '1.5mm', '1.75mm', '2mm', '2.2mm', '3mm', '3.5mm', '4mm', '4.5mm',
  '5mm', '5.5mm', '6mm', '6.5mm', '9mm', '10mm'
];

interface SwatchMeasurementFieldsProps {
  formData: {
    hook_size: string;
    stitches_per_inch: string;
    rows_per_inch: string;
  };
  onChange: (field: string, value: string) => void;
}

export const SwatchMeasurementFields = ({ formData, onChange }: SwatchMeasurementFieldsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <Label htmlFor="hook_size">Hook Size</Label>
        <Select value={formData.hook_size} onValueChange={(value) => onChange('hook_size', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select hook size" />
          </SelectTrigger>
          <SelectContent>
            {HOOK_SIZES.map((size) => (
              <SelectItem key={size} value={size}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="stitches_per_inch">Stitches per inch</Label>
        <Input
          id="stitches_per_inch"
          type="number"
          step="0.1"
          value={formData.stitches_per_inch}
          onChange={(e) => onChange('stitches_per_inch', e.target.value)}
          placeholder="e.g., 4.5"
        />
      </div>

      <div>
        <Label htmlFor="rows_per_inch">Rows per inch</Label>
        <Input
          id="rows_per_inch"
          type="number"
          step="0.1"
          value={formData.rows_per_inch}
          onChange={(e) => onChange('rows_per_inch', e.target.value)}
          placeholder="e.g., 5.0"
        />
      </div>
    </div>
  );
};
