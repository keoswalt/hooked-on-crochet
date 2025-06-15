
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { PlanImage } from "./usePlanImages";

// Accepts either array or updater fn (align with useState)
type SetImages = React.Dispatch<React.SetStateAction<PlanImage[]>>;

export function usePlanImageFeatured(images: PlanImage[], setImages: SetImages) {
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

    // Fix: Await the Supabase update and push actual promises to updates array
    const updates: Promise<any>[] = [];

    if (prevFeatured && prevFeatured.id !== imageId) {
      const unfeaturePromise = supabase
        .from("plan_images")
        .update({ is_featured: false })
        .eq("id", prevFeatured.id)
        .select('*')
        .then(r => r); // Make it a real promise
      updates.push(unfeaturePromise);
    }

    const featurePromise = supabase
      .from("plan_images")
      .update({ is_featured: true })
      .eq("id", imageId)
      .select('*')
      .then(r => r);
    updates.push(featurePromise);

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
