
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface YarnNotesFieldProps {
  notes: string;
  onChange: (notes: string) => void;
}

export const YarnNotesField = ({ notes, onChange }: YarnNotesFieldProps) => {
  return (
    <div>
      <Label htmlFor="notes">Notes</Label>
      <Textarea
        id="notes"
        value={notes}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Add any notes about this yarn"
        rows={3}
      />
    </div>
  );
};
