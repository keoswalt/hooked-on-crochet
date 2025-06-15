import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { PlanImage } from "./usePlanImages";

export function usePlanImageFeatured(images: PlanImage[], setImages: (imgs: PlanImage[]) => void) {
  const { toast } = useToast();

  const handleToggleFeatured = async (imageId: string) => {
    const prevFeatured = images.find(img => img.is_featured);

    if (prevFeatured?.id === imageId) {
      // Un-feature
      setImages(prev =>
        prev.map(img =>
          img.id === imageId ? { ...img, is_featured: false } : img
        )
      );
      const { error } = await supabase
        .from("plan_images")
        .update({ is_featured: false })
        .eq("id", imageId)
        .select('*');
      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
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
    setImages(prev =>
      prev.map(img =>
        img.id === imageId
          ? { ...img, is_featured: true }
          : { ...img, is_featured: false }
      )
    );

    const updates: Promise<any>[] = [];

    if (prevFeatured && prevFeatured.id !== imageId) {
      updates.push(
        supabase
          .from("plan_images")
          .update({ is_featured: false })
          .eq("id", prevFeatured.id)
          .select('*')
      );
    }

    updates.push(
      supabase
        .from("plan_images")
        .update({ is_featured: true })
        .eq("id", imageId)
        .select('*')
    );
    const results = await Promise.all(updates);
    const error = results.find(r => r?.error)?.error;
    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
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

  return { handleToggleFeatured };
}
