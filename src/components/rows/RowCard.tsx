
import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Minus, Plus, Copy, Trash2, GripVertical, Lock, Unlock, Check } from 'lucide-react';

interface ProjectRow {
  id: string;
  position: number;
  instructions: string;
  counter: number;
  type: string;
  make_mode_counter: number;
  make_mode_status: string;
  is_locked: boolean;
}

interface RowCardProps {
  row: ProjectRow;
  mode: 'edit' | 'make';
  onUpdateCounter: (id: string, newCounter: number) => void;
  onUpdateInstructions: (id: string, instructions: string) => void;
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
  onUpdateCounter, 
  onUpdateInstructions,
  onUpdateMakeModeCounter,
  onUpdateMakeModeStatus,
  onToggleLock,
  onDuplicate, 
  onDelete 
}: RowCardProps) => {
  const [localInstructions, setLocalInstructions] = useState(row.instructions);

  // Update local state when row prop changes
  useEffect(() => {
    setLocalInstructions(row.instructions);
  }, [row.instructions]);

  // Debounced function to update instructions in database
  const debouncedUpdateInstructions = useDebounce((id: string, instructions: string) => {
    onUpdateInstructions(id, instructions);
  }, 500);

  const handleInstructionsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setLocalInstructions(newValue);
    debouncedUpdateInstructions(row.id, newValue);
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

  // Render divider
  if (row.type === 'divider') {
    return (
      <Card className="mb-3">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {mode === 'edit' && <GripVertical className="h-4 w-4 text-gray-400 cursor-grab" />}
              {mode === 'make' && (
                <div className="w-6 h-6 rounded-full border-2 border-gray-300 bg-gray-100"></div>
              )}
              <hr className="flex-1 border-gray-300" />
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

  return (
    <Card className="mb-3">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {mode === 'edit' && <GripVertical className="h-4 w-4 text-gray-400 cursor-grab" />}
            {mode === 'make' && (
              <button 
                onClick={handleMakeModeCheck}
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  row.make_mode_status === 'complete' 
                    ? 'bg-green-500 border-green-500 text-white' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                {row.make_mode_status === 'complete' && <Check className="h-4 w-4" />}
              </button>
            )}
            <h3 className="font-semibold">
              {row.type === 'note' ? 'Note' : `Row ${row.position}`}
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
            <div className="flex items-center justify-center space-x-3 bg-gray-50 rounded-lg p-3">
              {mode === 'edit' ? (
                <>
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
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onToggleLock(row.id, !row.is_locked)}
                  >
                    {row.is_locked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleMakeModeCounterChange(Math.max(0, row.make_mode_counter - 1))}
                    disabled={row.make_mode_counter <= 0}
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
                    disabled={row.make_mode_counter >= row.counter}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
