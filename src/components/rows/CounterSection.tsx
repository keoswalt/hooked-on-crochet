
import { Button } from '@/components/ui/button';
import { Minus, Plus, Lock, Unlock } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type PatternRow = Database['public']['Tables']['pattern_rows']['Row'];

interface CounterSectionProps {
  row: PatternRow;
  mode: 'edit' | 'make';
  isCompleted: boolean;
  onUpdateCounter: (id: string, newCounter: number) => void;
  onToggleLock: (id: string, isLocked: boolean) => void;
  onMakeModeCounterChange: (newCounter: number) => void;
}

export const CounterSection = ({
  row,
  mode,
  isCompleted,
  onUpdateCounter,
  onToggleLock,
  onMakeModeCounterChange
}: CounterSectionProps) => {
  return (
    <div className="relative flex items-center justify-center space-x-3 bg-gray-50 rounded-lg p-3">
      {mode === 'edit' ? (
        <>
          <div className="flex items-center justify-center space-x-3 flex-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onUpdateCounter(row.id, Math.max(1, row.counter - 1))}
              disabled={row.counter <= 1 || row.is_locked}
            >
              <Minus className="h-4 w-4" />
            </Button>
            
            <div className="bg-white border rounded-md px-4 py-2 min-w-[60px] text-center font-semibold">
              {row.counter}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => onUpdateCounter(row.id, row.counter + 1)}
              disabled={row.is_locked}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onToggleLock(row.id, !row.is_locked)}
            className="absolute right-3"
          >
            {row.is_locked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
          </Button>
        </>
      ) : (
        <div className="flex items-center justify-center space-x-3 flex-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onMakeModeCounterChange(Math.max(0, row.make_mode_counter - 1))}
            disabled={row.make_mode_counter <= 0 || isCompleted}
          >
            <Minus className="h-4 w-4" />
          </Button>
          
          <div className="bg-white border rounded-md px-4 py-2 min-w-[80px] text-center font-semibold">
            {row.make_mode_counter} / {row.counter}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onMakeModeCounterChange(row.make_mode_counter + 1)}
            disabled={row.make_mode_counter >= row.counter || isCompleted}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};
