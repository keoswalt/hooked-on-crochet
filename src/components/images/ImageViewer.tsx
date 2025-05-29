
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Expand, X } from 'lucide-react';
import { ImageModal } from './ImageModal';

interface ImageViewerProps {
  imageUrl: string;
  alt: string;
  className?: string;
  onDelete?: () => void;
}

export const ImageViewer = ({ imageUrl, alt, className = "", onDelete }: ImageViewerProps) => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div className={`relative group ${className}`}>
        <img
          src={imageUrl}
          alt={alt}
          className="w-full h-full object-cover rounded-md"
        />
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 rounded-md flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowModal(true)}
              className="bg-white/90 hover:bg-white"
            >
              <Expand className="h-4 w-4" />
            </Button>
            {onDelete && (
              <Button
                variant="destructive"
                size="sm"
                onClick={onDelete}
                className="bg-red-500/90 hover:bg-red-600"
              >
                <X className="h-4 w-4" />
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
    </>
  );
};
