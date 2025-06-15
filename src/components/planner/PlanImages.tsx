
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ImageUploader } from '@/components/images/ImageUploader';
import { Plus, Star, Trash2, Image as ImageIcon } from 'lucide-react';
import { usePlanImages } from '@/hooks/usePlanImages';

interface PlanImagesProps {
  planId: string;
  userId: string;
}

export const PlanImages = ({ planId, userId }: PlanImagesProps) => {
  const { images, loading, addImage, setFeaturedImage, deleteImage } = usePlanImages(planId);
  const [showUploader, setShowUploader] = useState(false);

  const handleImageUploaded = async (imageUrl: string) => {
    await addImage(imageUrl, images.length === 0); // First image is featured by default
    setShowUploader(false);
  };

  if (loading) {
    return <div className="text-center py-8">Loading images...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Plan Images
          </CardTitle>
          <Button onClick={() => setShowUploader(true)} size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Add Image
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {images.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No images added yet</p>
            <p className="text-sm">Add images to visualize your plan</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {images.map((image) => (
              <div key={image.id} className="relative group">
                <div className="aspect-square overflow-hidden rounded-lg border">
                  <img
                    src={image.image_url}
                    alt="Plan image"
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Image Actions */}
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {!image.is_featured && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setFeaturedImage(image.id)}
                      title="Set as featured"
                    >
                      <Star className="h-3 w-3" />
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteImage(image.id)}
                    title="Delete image"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>

                {/* Featured Badge */}
                {image.is_featured && (
                  <div className="absolute top-2 left-2">
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                      <Star className="h-3 w-3 mr-1 fill-current" />
                      Featured
                    </Badge>
                  </div>
                )}

                {/* Upload Date */}
                <div className="absolute bottom-2 left-2">
                  <Badge variant="outline" className="bg-white/80 backdrop-blur-sm">
                    {new Date(image.uploaded_at || '').toLocaleDateString()}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Image Uploader */}
        {showUploader && (
          <div className="mt-4 p-4 border rounded-lg bg-gray-50">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-medium">Upload New Image</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowUploader(false)}
              >
                Cancel
              </Button>
            </div>
            <ImageUploader
              onImageUploaded={handleImageUploaded}
              userId={userId}
              folder="plans"
              accept="image/*"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};
