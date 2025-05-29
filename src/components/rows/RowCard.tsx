import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Minus, Plus, Copy, Trash2, GripVertical, Lock, Unlock, Check } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type ProjectRow = Database['public']['Tables']['project_rows']['Row'];

interface RowCardProps {
  row: ProjectRow;
  mode: 'edit' | 'make';
  rowNumber?: number;
  onUpdateCounter: (id: string, newCounter: number) => void;
  onUpdateInstructions: (id: string, instructions: string) => void;
  onUpdateTotalStitches: (id: string, totalStitches: number) => void;
  onUpdateMakeModeCounter: (id: string, newCounter: number) => void;
  onUpdateMakeModeStatus: (id: string, status: string) => void;
  onToggleLock: (id: string, isLocked: boolean) => void;
  onDuplicate: (row: ProjectRow) => void;
  onDelete: (id: string) => void;
}

// Debounce function
const useDebounce = (callback: Function, delay: number) => {
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout>();

  const debouncedCallback = useCallback((...args: any[]) => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    const timer = setTimeout(() => callback(...args), delay);
    setDebounceTimer(timer);
  }, [callback, delay, debounceTimer]);

  return debouncedCallback;
};

export const RowCard = ({ 
  row, 
  mode,
  rowNumber,
  onUpdateCounter, 
  onUpdateInstructions,
  onUpdateTotalStitches,
  onUpdateMakeModeCounter,
  onUpdateMakeModeStatus,
  onToggleLock,
  onDuplicate, 
  onDelete 
}: RowCardProps) => {
  const [localInstructions, setLocalInstructions] = useState(row.instructions);
  const [localTotalStitches, setLocalTotalStitches] = useState(row.total_stitches.toString());

  // Update local state when row prop changes
  useEffect(() => {
    setLocalInstructions(row.instructions);
    setLocalTotalStitches(row.total_stitches.toString());
  }, [row.instructions, row.total_stitches]);

  // Debounced function to update instructions in database
  const debouncedUpdateInstructions = useDebounce((id: string, instructions: string) => {
    onUpdateInstructions(id, instructions);
  }, 500);

  // Debounced function to update total stitches in database
  const debouncedUpdateTotalStitches = useDebounce((id: string, totalStitches: number) => {
    onUpdateTotalStitches(id, totalStitches);
  }, 500);

  const handleInstructionsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setLocalInstructions(newValue);
    debouncedUpdateInstructions(row.id, newValue);
  };

  const handleTotalStitchesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers
    if (value === '' || /^\d+$/.test(value)) {
      setLocalTotalStitches(value);
      const numValue = value === '' ? 0 : parseInt(value, 10);
      debouncedUpdateTotalStitches(row.id, numValue);
    }
  };

  const handleMakeModeCheck = () => {
    if (row.make_mode_status === 'complete') {
      onUpdateMakeModeStatus(row.id, 'in_progress');
    } else {
      onUpdateMakeModeStatus(row.id, 'complete');
    }
  };

  const handleMakeModeCounterChange = (newCounter: number) => {
    onUpdateMakeModeCounter(row.id, newCounter);
    if (newCounter >= row.counter && row.make_mode_status !== 'complete') {
      onUpdateMakeModeStatus(row.id, 'complete');
    }
  };

  // Determine card styling based on make mode status
  const getCardStyling = () => {
    if (mode !== 'make') return '';
    
    switch (row.make_mode_status) {
      case 'complete':
        return 'bg-muted border-muted-foreground/30';
      case 'in_progress':
        return 'bg-white border-blue-300 shadow-lg ring-2 ring-blue-200 dark:bg-card dark:border-blue-400 dark:ring-blue-300';
      case 'not_started':
        return 'bg-gray-50 border-gray-200 opacity-60 dark:bg-muted/50 dark:border-muted-foreground/20';
      default:
        return '';
    }
  };

  // Render divider
  if (row.type === 'divider') {
    return (
      <Card className={`mb-3 ${getCardStyling()}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 flex-1">
              {mode === 'edit' && <GripVertical className="h-4 w-4 text-gray-400 cursor-grab" />}
              <div className="flex-1 flex items-center justify-center px-4">
                <svg width="100%" height="2" className="text-gray-400">
                  <line x1="0" y1="1" x2="100%" y2="1" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" />
                </svg>
              </div>
            </div>
            {mode === 'edit' && (
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={() => onDuplicate(row)}>
                  <Copy className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => onDelete(row.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
      </Card>
    );
  }

  const isCompleted = mode === 'make' && row.make_mode_status === 'complete';
  const isCheckboxDisabled = mode === 'make' && row.make_mode_status === 'not_started';

  return (
    <Card className={`mb-3 ${getCardStyling()}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {mode === 'edit' && <GripVertical className="h-4 w-4 text-gray-400 cursor-grab" />}
            {mode === 'make' && row.type !== 'divider' && (
              <button 
                onClick={handleMakeModeCheck}
                disabled={isCheckboxDisabled}
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  row.make_mode_status === 'complete' 
                    ? 'bg-foreground border-foreground text-background' 
                    : isCheckboxDisabled
                    ? 'border-gray-200 bg-gray-100 cursor-not-allowed dark:border-muted-foreground/30 dark:bg-muted/50'
                    : 'border-gray-300 hover:border-gray-400 dark:border-muted-foreground dark:hover:border-muted-foreground/80'
                }`}
              >
                {row.make_mode_status === 'complete' && <Check className="h-4 w-4" />}
              </button>
            )}
            <h3 className="font-semibold">
              {row.type === 'note' ? 'Note' : `Row ${rowNumber || row.position}`}
            </h3>
          </div>
          {mode === 'edit' && (
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={() => onDuplicate(row)}>
                <Copy className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => onDelete(row.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <textarea
            value={localInstructions}
            onChange={handleInstructionsChange}
            className="w-full p-2 border rounded-md min-h-[80px] resize-none"
            placeholder={`Enter ${row.type} instructions...`}
            disabled={mode === 'make'}
          />
          
          {row.type === 'row' && (
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700 min-w-[100px]">Total Stitches:</label>
                <Input
                  type="text"
                  value={localTotalStitches}
                  onChange={handleTotalStitchesChange}
                  className="flex-1"
                  placeholder="0"
                  disabled={mode === 'make'}
                />
              </div>
              
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
                      onClick={() => handleMakeModeCounterChange(Math.max(0, row.make_mode_counter - 1))}
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
                      onClick={() => handleMakeModeCounterChange(row.make_mode_counter + 1)}
                      disabled={row.make_mode_counter >= row.counter || isCompleted}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
