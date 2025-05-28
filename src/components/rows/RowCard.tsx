
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Minus, Plus, Copy, Trash2, GripVertical } from 'lucide-react';

interface ProjectRow {
  id: string;
  position: number;
  instructions: string;
  counter: number;
}

interface RowCardProps {
  row: ProjectRow;
  onUpdateCounter: (id: string, newCounter: number) => void;
  onUpdateInstructions: (id: string, instructions: string) => void;
  onDuplicate: (row: ProjectRow) => void;
  onDelete: (id: string) => void;
}

export const RowCard = ({ 
  row, 
  onUpdateCounter, 
  onUpdateInstructions, 
  onDuplicate, 
  onDelete 
}: RowCardProps) => {
  return (
    <Card className="mb-3">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <GripVertical className="h-4 w-4 text-gray-400 cursor-grab" />
            <h3 className="font-semibold">Row {row.position}</h3>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => onDuplicate(row)}>
              <Copy className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => onDelete(row.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <textarea
            value={row.instructions}
            onChange={(e) => onUpdateInstructions(row.id, e.target.value)}
            className="w-full p-2 border rounded-md min-h-[80px] resize-none"
            placeholder="Enter row instructions..."
          />
          
          <div className="flex items-center justify-center space-x-3 bg-gray-50 rounded-lg p-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onUpdateCounter(row.id, Math.max(1, row.counter - 1))}
              disabled={row.counter <= 1}
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
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
