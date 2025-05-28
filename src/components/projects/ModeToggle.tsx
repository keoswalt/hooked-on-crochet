
import { Button } from '@/components/ui/button';

interface ModeToggleProps {
  mode: 'edit' | 'make';
  onModeChange: (mode: 'edit' | 'make') => void;
}

export const ModeToggle = ({ mode, onModeChange }: ModeToggleProps) => {
  return (
    <div className="inline-flex rounded-lg border overflow-hidden">
      <Button
        variant={mode === 'edit' ? 'default' : 'outline'}
        onClick={() => onModeChange('edit')}
        className="rounded-none border-0"
      >
        Edit
      </Button>
      <Button
        variant={mode === 'make' ? 'default' : 'outline'}
        onClick={() => onModeChange('make')}
        className="rounded-none border-0"
      >
        Make
      </Button>
    </div>
  );
};
