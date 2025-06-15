
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface SwatchNotesFieldProps {
  notes: string;
  onChange: (notes: string) => void;
}

export const SwatchNotesField = ({ notes, onChange }: SwatchNotesFieldProps) => {
  return (
    <div>
      <Label htmlFor="notes">Notes</Label>
      <Textarea
        id="notes"
        value={notes}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Add any notes about this swatch"
        rows={3}
      />
    </div>
  );
};
