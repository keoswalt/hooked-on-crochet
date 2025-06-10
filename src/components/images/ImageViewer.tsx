import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Expand, Trash2 } from 'lucide-react';
import { ImageModal } from './ImageModal';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';

interface ImageViewerProps {
  imageUrl: string;
  alt: string;
  className?: string;
  onDelete?: () => void;
}

export const ImageViewer = ({ imageUrl, alt, className = "", onDelete }: ImageViewerProps) => {
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleExpandClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setShowModal(true);
  };

  const handleDeleteClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    if (onDelete) {
      onDelete();
    }
    setShowDeleteConfirm(false);
  };

  return (
    <>
      <div className={`relative group ${className}`}>
        <img
          src={imageUrl}
          alt={alt}
          className="w-full h-full object-cover object-top rounded-md"
        />
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 rounded-md flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleExpandClick}
              className="bg-white/90 hover:bg-white"
            >
              <Expand className="h-4 w-4" />
            </Button>
            {onDelete && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleDeleteClick}
                className="bg-red-500/90 hover:bg-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
      
      <ImageModal
        imageUrl={imageUrl}
        alt={alt}
        open={showModal}
        onOpenChange={setShowModal}
      />

      <ConfirmationDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Delete Image"
        description="Are you sure you want to delete this image? This action cannot be undone."
        onConfirm={handleConfirmDelete}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </>
  );
};
