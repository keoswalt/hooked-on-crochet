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
    // Add new image at the end (DO NOT set featured automatically)
    const maxPos = images.length > 0 ? Math.max(...images.map(img => img.position ?? 0)) : 0;
    const { data, error } = await supabase
      .from("plan_images")
      .insert({
        plan_id: plannerId,
        user_id: userId,
        image_url: imageUrl,
        position: maxPos + 1,
        is_featured: false, // never set via upload
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
    setImages(prev => {
      const filtered = prev.filter(i => i.id !== imageId);
      // Update positions to be sequential (1-based)
      return filtered
        .map((img, idx) => ({ ...img, position: idx + 1 }));
    });
    setImagesLoading(false);
  };

  // New: Simpler featured toggle logic
  const handleToggleFeatured = async (imageId: string) => {
    // Find currently featured image
    const prevFeatured = images.find(img => img.is_featured);

    // If this image is currently featured, un-feature it
    if (prevFeatured?.id === imageId) {
      // Optimistic UI update
      setImages(prev =>
        prev.map(img =>
          img.id === imageId ? { ...img, is_featured: false } : img
        )
      );
      // Update DB: set is_featured = false for this image
      const { error } = await supabase
        .from("plan_images")
        .update({ is_featured: false })
        .eq("id", imageId);
      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
        // Revert UI change if error
        setImages(prev =>
          prev.map(img =>
            img.id === imageId ? { ...img, is_featured: true } : img
          )
        );
      } else {
        toast({
          title: "Featured image removed",
          description: "This image is no longer featured.",
        });
      }
      return;
    }

    // Otherwise, set this as featured and unset previous
    // Optimistic UI update
    setImages(prev =>
      prev.map(img =>
        img.id === imageId
          ? { ...img, is_featured: true }
          : { ...img, is_featured: false }
      )
    );

    // Update DB
    // Fix: use .select() at the end of each query builder to get a Promise
    const updates: Promise<any>[] = [];

    if (prevFeatured && prevFeatured.id !== imageId) {
      updates.push(
        supabase
          .from("plan_images")
          .update({ is_featured: false })
          .eq("id", prevFeatured.id)
          .select()
      );
    }

    updates.push(
      supabase
        .from("plan_images")
        .update({ is_featured: true })
        .eq("id", imageId)
        .select()
    );

    // Await all updates
    const results = await Promise.all(updates);

    // Check for errors
    const error = results.find(r => r?.error)?.error;
    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      // Try to revert UI state
      setImages(prev =>
        prev.map(img => {
          if (img.id === imageId) return { ...img, is_featured: false };
          if (img.id === prevFeatured?.id) return { ...img, is_featured: true };
          return img;
        })
      );
    } else {
      toast({
        title: "Featured image updated!",
        description: "This image is now featured.",
      });
    }
  };

  // Sync positions in DB if deleted (keep logic, but NO featured update!)
  useEffect(() => {
    async function syncPositions() {
      if (!images.length) return;
      const needsUpdate = images.some((img, idx) => img.position !== idx + 1);
      if (!needsUpdate) return;
      const updates = images.map((img, idx) => ({
        id: img.id,
        position: idx + 1,
        plan_id: img.plan_id,
        user_id: img.user_id,
        image_url: img.image_url,
        is_featured: img.is_featured,
        uploaded_at: img.uploaded_at,
      }));
      await supabase.from("plan_images").upsert(updates, { onConflict: "id" });
    }
    syncPositions();
    // eslint-disable-next-line
  }, [images.length]);

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
        onDeleteImage={handleDeleteImage}
        onReorder={reorderImages}
        reordering={reordering}
        onToggleFeatured={handleToggleFeatured}
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
