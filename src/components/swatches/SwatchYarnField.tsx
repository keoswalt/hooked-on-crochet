
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface SwatchYarnFieldProps {
  yarnUsed: string;
  onChange: (yarnUsed: string) => void;
}

export const SwatchYarnField = ({ yarnUsed, onChange }: SwatchYarnFieldProps) => {
  return (
    <div>
      <Label htmlFor="yarn_used">Yarn Used</Label>
      <Input
        id="yarn_used"
        value={yarnUsed}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter yarn information"
      />
    </div>
  );
};
