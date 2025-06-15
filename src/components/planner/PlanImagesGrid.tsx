
import { useState } from "react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { ImageViewer } from "@/components/images/ImageViewer";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

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
}
export const PlanImagesGrid = ({ images, loading, onDeleteImage }: PlanImagesGridProps) => {
  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="animate-spin h-6 w-6 text-gray-400" />
      </div>
    );
  }
  if (!images.length) {
    return <div className="text-muted-foreground py-6">No images added yet.</div>;
  }
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {images.map(img => (
        <AspectRatio ratio={1} key={img.id} className="relative w-full bg-gray-50 rounded-md overflow-hidden">
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
  );
};
export default PlanImagesGrid;
