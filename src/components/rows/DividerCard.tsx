
import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { GripVertical, Copy, Trash2 } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type ProjectRow = Database['public']['Tables']['project_rows']['Row'];

interface DividerCardProps {
  row: ProjectRow;
  mode: 'edit' | 'make';
  localLabel: string;
  onLabelChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onLabelFocus: () => void;
  onLabelBlur: () => void;
  onDuplicate: (row: ProjectRow) => void;
  onDelete: (id: string) => void;
  cardStyling: string;
}

export const DividerCard = ({
  row,
  mode,
  localLabel,
  onLabelChange,
  onLabelFocus,
  onLabelBlur,
  onDuplicate,
  onDelete,
  cardStyling
}: DividerCardProps) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = () => {
    onDelete(row.id);
    setShowDeleteConfirm(false);
  };

  return (
    <>
      <Card className={`mb-3 ${cardStyling}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 flex-1 mr-3">
              {mode === 'edit' && <GripVertical className="h-4 w-4 text-white cursor-grab" />}
              {mode === 'edit' && (
                <Input
                  value={localLabel}
                  onChange={onLabelChange}
                  onFocus={onLabelFocus}
                  onBlur={onLabelBlur}
                  placeholder="Enter divider label (optional)"
                  className="flex-1 text-lg font-medium bg-gray-700 border-gray-600 text-white placeholder:text-gray-300"
                />
              )}
              {mode === 'make' && localLabel && (
                <div className="flex-1 text-center">
                  <p className="text-lg font-medium text-gray-600">{localLabel}</p>
                </div>
              )}
            </div>
            {mode === 'edit' && (
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={() => onDuplicate(row)} className="border-gray-300 text-gray-700 hover:bg-gray-400 bg-white">
                  <Copy className="h-4 w-4 text-gray-700" />
                </Button>
                <Button variant="outline" size="sm" onClick={handleDeleteClick} className="border-gray-300 text-gray-700 hover:bg-gray-400 bg-white">
                  <Trash2 className="h-4 w-4 text-gray-700" />
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center justify-center px-4">
            <svg width="100%" height="2" className="text-gray-500">
              <line x1="0" y1="1" x2="100%" y2="1" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" />
            </svg>
          </div>
        </CardContent>
      </Card>

      <ConfirmationDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Delete divider?"
        description="This will permanently delete this divider. This action cannot be undone."
        onConfirm={handleDeleteConfirm}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </>
  );
};
