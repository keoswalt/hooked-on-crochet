
import { Download, Edit, FileText, Trash2, Copy, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { QRCodeGenerator } from './QRCodeGenerator';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import type { Database } from '@/integrations/supabase/types';

type Project = Database['public']['Tables']['projects']['Row'];

interface ProjectActionsProps {
  project: Project;
  onEdit: () => void;
  onDelete: () => void;
  onExport: () => void;
  onExportPDF: () => void;
  onDuplicate: () => void;
}

export const ProjectActions = ({ 
  project, 
  onEdit, 
  onDelete, 
  onExport, 
  onExportPDF,
  onDuplicate
}: ProjectActionsProps) => {
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
      <QRCodeGenerator project={project} />
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
