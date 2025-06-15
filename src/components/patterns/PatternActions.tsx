
import { Download, Edit, FileText, Trash2, Copy, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { QRCodeGenerator } from '../projects/QRCodeGenerator';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import type { Database } from '@/integrations/supabase/types';

type Pattern = Database['public']['Tables']['patterns']['Row'];

interface PatternActionsProps {
  pattern: Pattern;
  onEdit: () => void;
  onDelete: () => void;
  onExport: () => void;
  onExportPDF: () => void;
  onDuplicate: () => void;
}

export const PatternActions = ({ 
  pattern, 
  onEdit, 
  onDelete, 
  onExport, 
  onExportPDF,
  onDuplicate
}: PatternActionsProps) => {
  return (
    <div className="flex items-center flex-wrap gap-2">
      <Button variant="outline" size="sm" onClick={onEdit}>
        <Edit className="h-4 w-4" />
      </Button>
      <Button variant="outline" size="sm" onClick={onDuplicate}>
        <Copy className="h-4 w-4" />
      </Button>
      <Button variant="outline" size="sm" onClick={onDelete}>
        <Trash2 className="h-4 w-4" />
      </Button>
      <QRCodeGenerator project={pattern} />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
            <ChevronDown className="h-4 w-4 ml-2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onExport}>
            <Download className="h-4 w-4 mr-2" />
            Export Pattern File (.crochet)
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onExportPDF}>
            <FileText className="h-4 w-4 mr-2" />
            Export as PDF
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
