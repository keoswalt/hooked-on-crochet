
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Download, ChevronDown } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { QRCodeGenerator } from './QRCodeGenerator';
import type { Database } from '@/integrations/supabase/types';

type Project = Database['public']['Tables']['projects']['Row'];

interface ProjectActionsProps {
  project: Project;
  onEdit: () => void;
  onDelete: () => void;
  onExport: () => void;
  onExportPDF: () => void;
}

export const ProjectActions = ({ 
  project, 
  onEdit, 
  onDelete, 
  onExport, 
  onExportPDF 
}: ProjectActionsProps) => {
  return (
    <div className="flex items-center gap-2 w-full flex-wrap">
      <Button variant="outline" onClick={onEdit} className="flex-1 sm:flex-none">
        <Edit className="h-4 w-4 mr-2" />
        Edit Project
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex-1 sm:flex-none">
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
            <Download className="h-4 w-4 mr-2" />
            Export as PDF
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <QRCodeGenerator project={project} />
      <Button variant="outline" onClick={onDelete}>
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};
