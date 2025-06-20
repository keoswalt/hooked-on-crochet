
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { PlanImage } from "./usePlanImages";

export function usePlanImagesReorder(
  images: PlanImage[],
  setImages: React.Dispatch<React.SetStateAction<PlanImage[]>>,
  planId: string,
  userId: string
) {
  const [reordering, setReordering] = useState(false);
  const { toast } = useToast();

  const reorderImages = async (sourceIdx: number, destIdx: number) => {
    if (sourceIdx === destIdx || sourceIdx < 0 || destIdx < 0) return;
    setReordering(true);

    // Create a new ordered list
    const newImages = Array.from(images);
    const [removed] = newImages.splice(sourceIdx, 1);
    newImages.splice(destIdx, 0, removed);

    // Prepare bulk update data for Supabase
    const updates = newImages.map((img, idx) => ({
      id: img.id,
      position: idx + 1,
      plan_id: img.plan_id,
      image_url: img.image_url,
      user_id: img.user_id,
      ...(img.uploaded_at !== undefined ? { uploaded_at: img.uploaded_at } : {}),
      ...(img.is_featured !== undefined ? { is_featured: img.is_featured } : {}),
    }));

    // Optimistically update UI (Direct array, not callback)
    setImages(
      images
        .map(img => {
          const up = updates.find(u => u.id === img.id);
          return up ? { ...img, position: up.position } : img;
        })
        .sort((a, b) => a.position - b.position)
    );

    // Upsert full required fields
    const { error } = await supabase
      .from("plan_images")
      .upsert(updates, { onConflict: "id" });

    if (error) {
      toast({
        title: "Reorder failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({ title: "Images reordered" });
    }
    setReordering(false);
  };

  return { reorderImages, reordering };
}
