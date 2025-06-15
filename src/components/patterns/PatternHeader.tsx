
import { Card, CardContent } from '@/components/ui/card';
import { PatternActions } from './PatternActions';
import type { Database } from '@/integrations/supabase/types';

type Pattern = Database['public']['Tables']['patterns']['Row'];

interface PatternHeaderProps {
  pattern: Pattern;
  onEdit: () => void;
  onDelete: () => void;
  onExport: () => void;
  onExportPDF: () => void;
  onDuplicate: () => void;
}

export const PatternHeader = ({
  pattern,
  onEdit,
  onDelete,
  onExport,
  onExportPDF,
  onDuplicate,
}: PatternHeaderProps) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{pattern.name}</h1>
          </div>
          <PatternActions
            pattern={pattern}
            onEdit={onEdit}
            onDelete={onDelete}
            onExport={onExport}
            onExportPDF={onExportPDF}
            onDuplicate={onDuplicate}
          />
        </div>
      </CardContent>
    </Card>
  );
};
