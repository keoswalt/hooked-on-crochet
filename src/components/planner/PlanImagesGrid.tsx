
import { useRef, useState } from "react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { ImageViewer } from "@/components/images/ImageViewer";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import clsx from "clsx";

interface PlanImage {
  id: string;
  image_url: string;
  is_featured?: boolean;
  uploaded_at?: string;
}
interface PlanImagesGridProps {
  images: PlanImage[];
  loading: boolean;
  onDeleteImage: (imageId: string) => void;
  onDropFiles?: (files: File[]) => void;
}

export const PlanImagesGrid = ({
  images,
  loading,
  onDeleteImage,
  onDropFiles,
}: PlanImagesGridProps) => {
  const [dragActive, setDragActive] = useState(false);
  const dropRef = useRef<HTMLDivElement | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!dragActive) setDragActive(true);
  };
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const files = Array.from(e.dataTransfer.files).filter(file =>
      file.type.startsWith("image/")
    );
    if (files.length && onDropFiles) {
      onDropFiles(files);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="animate-spin h-6 w-6 text-gray-400" />
      </div>
    );
  }
  // Use "drop zone" for empty state or always (allow drop anywhere in grid)
  return (
    <div
      ref={dropRef}
      className={clsx(
        "relative min-h-[128px]",
        dragActive &&
          "ring-2 ring-primary ring-inset bg-primary/5 transition-all"
      )}
      onDragOver={handleDragOver}
      onDragEnter={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      tabIndex={-1}
    >
      {/* Overlay for Drag feedback */}
      {dragActive && (
        <div className="absolute z-10 inset-0 bg-primary/20 flex items-center justify-center pointer-events-none select-none">
          <span className="text-primary font-semibold text-lg">Drop images to upload</span>
        </div>
      )}
      {!images.length ? (
        <div className={clsx(
          "flex flex-col space-y-2 items-center justify-center py-12 opacity-90 transition-all",
          dragActive && "opacity-60"
        )}>
          <span className="text-muted-foreground">
            <strong>Drag and drop images here</strong>
            <br/>or use the Add Image button.
          </span>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {images.map((img) => (
            <AspectRatio
              ratio={1}
              key={img.id}
              className="relative w-full bg-gray-50 rounded-md overflow-hidden"
            >
              <ImageViewer
                imageUrl={img.image_url}
                alt="Plan Image"
                className="w-full h-full"
                onDelete={() => onDeleteImage(img.id)}
              />
              {img.is_featured && (
                <span className="absolute left-2 top-2 px-2 py-1 bg-primary text-white text-xs rounded shadow">
                  Featured
                </span>
              )}
            </AspectRatio>
          ))}
        </div>
      )}
    </div>
  );
};
export default PlanImagesGrid;
