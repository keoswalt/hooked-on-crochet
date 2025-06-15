
import { useState } from "react";
import PlannerSection from "./PlannerSection";
import PlanImagesGrid from "./PlanImagesGrid";
import PlanImageUploadDialog from "./PlanImageUploadDialog";
import { usePlanImages } from "@/hooks/usePlanImages";
import { usePlanImagesReorder } from "@/hooks/usePlanImagesReorder";
import { usePlanImageFeatured } from "@/hooks/usePlanImageFeatured";

interface PlannerImagesSectionProps {
  plannerId: string;
  userId: string;
}

const PlannerImagesSection = ({ plannerId, userId }: PlannerImagesSectionProps) => {
  const {
    images,
    setImages,
    imagesLoading,
    addImage,
    deleteImage
  } = usePlanImages(plannerId, userId);

  const [showImagesUpload, setShowImagesUpload] = useState(false);

  const { handleToggleFeatured } = usePlanImageFeatured(images, setImages);

  // Drag and drop reorder logic (pure position—not is_featured)
  const { reorderImages, reordering } = usePlanImagesReorder(
    images,
    setImages,
    plannerId,
    userId
  );

  return (
    <PlannerSection
      title="Images"
      buttonText="Add Image"
      buttonDisabled={false}
      onAdd={() => setShowImagesUpload(true)}
    >
      <PlanImagesGrid
        images={images}
        loading={imagesLoading}
        onDeleteImage={deleteImage}
        onReorder={reorderImages}
        reordering={reordering}
        onToggleFeatured={handleToggleFeatured}
      />
      <PlanImageUploadDialog
        open={showImagesUpload}
        onOpenChange={setShowImagesUpload}
        userId={userId}
        planId={plannerId}
        onImageAdded={addImage}
      />
    </PlannerSection>
  );
};

export default PlannerImagesSection;
