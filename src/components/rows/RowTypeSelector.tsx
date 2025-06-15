
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Plus, FileText, Minus, ChevronDown } from 'lucide-react';

interface RowTypeSelectorProps {
  onAddRow: (insertAfterPosition?: number) => void;
  onAddNote: (insertAfterPosition?: number) => void;
  onAddDivider: (insertAfterPosition?: number) => void;
}

export const RowTypeSelector = ({ onAddRow, onAddNote, onAddDivider }: RowTypeSelectorProps) => {
  return (
    <div className="flex">
      <Button onClick={() => onAddRow()} className="rounded-r-none border-r-0">
        <Plus className="h-4 w-4 mr-2" />
        Add
      </Button>
      <div className="w-px bg-white"></div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="default" className="rounded-l-none px-2">
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-white border shadow-md">
          <DropdownMenuItem onClick={() => onAddRow()} className="cursor-pointer">
            <Plus className="h-4 w-4 mr-2" />
            Add Row
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onAddNote()} className="cursor-pointer">
            <FileText className="h-4 w-4 mr-2" />
            Add Note
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onAddDivider()} className="cursor-pointer">
            <Minus className="h-4 w-4 mr-2" />
            Add Divider
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
