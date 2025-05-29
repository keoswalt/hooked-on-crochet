import React, { useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Copy, Trash, Image } from 'lucide-react';
import { ImageUploader } from '@/components/images/ImageUploader';
import { ImageViewer } from '@/components/images/ImageViewer';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type ProjectRow = Database['public']['Tables']['project_rows']['Row'];

interface RowCardProps {
  row: ProjectRow;
  onEdit: (row: ProjectRow) => void;
  onDelete: (row: ProjectRow) => void;
  onDuplicate: (row: ProjectRow) => void;
  onImageUpload: (row: ProjectRow, imageUrl: string) => void;
  onImageDelete: (row: ProjectRow) => void;
  userId: string;
}

export const RowCard: React.FC<RowCardProps> = ({
  row,
  onEdit,
  onDelete,
  onDuplicate,
  onImageUpload,
  onImageDelete,
  userId
}) => {
  const [showReplaceDialog, setShowReplaceDialog] = useState(false);
  const imageUploaderRef = useRef<any>(null);
  const { toast } = useToast();

  const handleEditClick = () => {
    onEdit(row);
  };

  const handleDeleteClick = () => {
    onDelete(row);
  };

  const handleDuplicateClick = () => {
    onDuplicate(row);
  };

  const handleImageClick = () => {
    if (row.image_url) {
      setShowReplaceDialog(true);
    } else {
      imageUploaderRef.current?.triggerUpload();
    }
  };

  const handleReplaceConfirm = () => {
    imageUploaderRef.current?.triggerUpload();
    setShowReplaceDialog(false);
  };

  const handleImageUpload = (imageUrl: string) => {
    onImageUpload(row, imageUrl);
    toast({
      title: "Image uploaded",
      description: "The image has been uploaded successfully.",
    });
  };

  const handleImageDelete = async () => {
    await onImageDelete(row);
    toast({
      title: "Image deleted",
      description: "The image has been deleted successfully.",
    });
  };

  return (
    <Card className="w-full bg-white shadow-sm border-gray-200">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            {/* Row counter and type display */}
            <div className="text-sm text-gray-500">
              Row {row.counter} - {row.type}
            </div>
            
            <div className="mt-2">
              {row.type === 'divider' ? (
                <div className="border-t-2 border-gray-300 my-4" />
              ) : (
                <div>
                  <div className="text-gray-900 text-sm leading-relaxed whitespace-pre-wrap">
                    {row.instructions}
                  </div>
                  {row.label && (
                    <div className="text-xs text-gray-500 mt-1">
                      Label: {row.label}
                    </div>
                  )}
                  {row.total_stitches > 0 && (
                    <div className="text-xs text-gray-500 mt-1">
                      Total stitches: {row.total_stitches}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Image display */}
            {row.image_url && (
              <div className="mt-3">
                <ImageViewer
                  imageUrl={row.image_url}
                  alt={`Row ${row.counter} image`}
                  className="w-full max-w-xs h-32 rounded-lg"
                  onDelete={handleImageDelete}
                />
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex flex-col space-y-2 ml-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleEditClick}
              className="p-2"
              title="Edit row"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDuplicateClick}
              className="p-2"
              title="Duplicate row"
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDeleteClick}
              className="p-2"
              title="Delete row"
            >
              <Trash className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleImageClick}
              className="p-2"
              title={row.image_url ? "Replace image" : "Add image"}
            >
              <Image className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>

      {/* Image uploader (hidden) */}
      <ImageUploader
        ref={imageUploaderRef}
        onImageUploaded={handleImageUpload}
        userId={userId}
        folder="rows"
        className="hidden"
        showUploadButton={false}
      />

      {/* Replace image confirmation dialog */}
      <ConfirmationDialog
        isOpen={showReplaceDialog}
        onConfirm={handleReplaceConfirm}
        onCancel={() => setShowReplaceDialog(false)}
        title="Replace Image"
        description="This will delete the current image and replace it with a new one. This action cannot be undone."
        confirmText="Replace"
        cancelText="Cancel"
      />
    </Card>
  );
};
