
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface PatternDetailsFieldProps {
  details: string;
  onDetailsChange: (details: string) => void;
}

export const PatternDetailsField = ({ details, onDetailsChange }: PatternDetailsFieldProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="details">Details & Notes</Label>
      <Textarea
        id="details"
        value={details}
        onChange={(e) => onDetailsChange(e.target.value)}
        placeholder="Add any additional details, notes, or special instructions..."
        rows={4}
      />
    </div>
  );
};
