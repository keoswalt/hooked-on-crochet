import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import PlannerSection from "./PlannerSection";
import PlanImagesGrid from "./PlanImagesGrid";
import PlanImageUploadDialog from "./PlanImageUploadDialog";
import { usePlanImagesReorder } from "@/hooks/usePlanImagesReorder";

interface PlannerImagesSectionProps {
  plannerId: string;
  userId: string;
}

const PlannerImagesSection = ({ plannerId, userId }: PlannerImagesSectionProps) => {
  const [images, setImages] = useState<any[]>([]);
  const [imagesLoading, setImagesLoading] = useState(true);
  const [showImagesUpload, setShowImagesUpload] = useState(false);
  const { toast } = useToast();

  // Fetch images
  useEffect(() => {
    const fetchImages = async () => {
      setImagesLoading(true);
      const { data, error } = await supabase
        .from("plan_images")
        .select("*")
        .eq("plan_id", plannerId)
        .order("position", { ascending: true })
        .limit(100);
      if (!error && data) setImages(data);
      setImagesLoading(false);
    };
    if (plannerId) fetchImages();
  }, [plannerId]);

  // Add image handler
  const handleImageAdded = async (imageUrl: string) => {
    // Add new image at the end
    const maxPos = images.length > 0 ? Math.max(...images.map(img => img.position ?? 0)) : 0;
    const { data, error } = await supabase
      .from("plan_images")
      .insert({
        plan_id: plannerId,
        user_id: userId,
        image_url: imageUrl,
        position: maxPos + 1,
      })
      .select();
    if (!error && data?.[0]) {
      setImages(images => [...images, data[0]]);
    }
  };

  // Delete image handler
  const handleDeleteImage = async (imageId: string) => {
    setImagesLoading(true);
    await supabase.from("plan_images").delete().eq("id", imageId).eq("plan_id", plannerId);
    // Re-number remaining positions for sequential order
    setImages(prev => {
      const filtered = prev.filter(i => i.id !== imageId);
      // Update positions to be sequential (1-based)
      return filtered
        .map((img, idx) => ({ ...img, position: idx + 1 }));
    });
    setImagesLoading(false);
  };

  // Sync positions in DB if deleted
  useEffect(() => {
    async function syncPositions() {
      if (!images.length) return;
      const needsUpdate = images.some((img, idx) => img.position !== idx + 1);
      if (!needsUpdate) return;
      const updates = images.map((img, idx) => ({
        id: img.id,
        position: idx + 1,
      }));
      await supabase.from("plan_images").upsert(updates, { onConflict: "id" });
    }
    syncPositions();
    // eslint-disable-next-line
  }, [images.length]);

  // Drag and drop reorder logic
  const { reorderImages, reordering } = usePlanImagesReorder(
    images,
    setImages
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
        onDeleteImage={handleDeleteImage}
        onReorder={reorderImages}
        reordering={reordering}
      />
      <PlanImageUploadDialog
        open={showImagesUpload}
        onOpenChange={setShowImagesUpload}
        userId={userId}
        planId={plannerId}
        onImageAdded={handleImageAdded}
      />
    </PlannerSection>
  );
};

export default PlannerImagesSection;
