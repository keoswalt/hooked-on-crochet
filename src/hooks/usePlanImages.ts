import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// PlanImage used everywhere for plan images (ALL FIELDS required, inc. plan_id, user_id)
export interface PlanImage {
  id: string;
  image_url: string;
  is_featured: boolean;
  uploaded_at?: string;
  position: number;
  plan_id: string;
  user_id: string;
}

export function usePlanImages(planId: string, userId: string) {
  const [images, setImages] = useState<PlanImage[]>([]);
  const [imagesLoading, setImagesLoading] = useState(true);
  const { toast } = useToast();

  // Fetch images
  const fetchImages = useCallback(async () => {
    setImagesLoading(true);
    const { data, error } = await supabase
      .from("plan_images")
      .select("*")
      .eq("plan_id", planId)
      .order("position", { ascending: true })
      .limit(100);
    if (!error && data) setImages(data as PlanImage[]);
    setImagesLoading(false);
  }, [planId]);

  useEffect(() => {
    if (planId) fetchImages();
  }, [planId, fetchImages]);

  // Add image handler
  const addImage = async (imageUrl: string) => {
    const maxPos = images.length > 0 ? Math.max(...images.map(img => img.position ?? 0)) : 0;
    const { data, error } = await supabase
      .from("plan_images")
      .insert({
        plan_id: planId,
        user_id: userId,
        image_url: imageUrl,
        position: maxPos + 1,
        is_featured: false, // never set via upload
      })
      .select();
    if (!error && data?.[0]) {
      setImages(images => [...images, data[0] as PlanImage]);
    }
  };

  // Delete image handler
  const deleteImage = async (imageId: string) => {
    setImagesLoading(true);
    await supabase.from("plan_images").delete().eq("id", imageId).eq("plan_id", planId);
    setImages(prev => {
      const filtered = prev.filter(i => i.id !== imageId);
      // Update positions to be sequential (1-based)
      return filtered.map((img, idx) => ({ ...img, position: idx + 1 }));
    });
    setImagesLoading(false);
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

  return {
    images,
    setImages,
    imagesLoading,
    addImage,
    deleteImage
  };
}
