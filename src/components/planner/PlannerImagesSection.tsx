
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import PlannerSection from "./PlannerSection";
import PlanImagesGrid from "./PlanImagesGrid";
import PlanImageUploadDialog from "./PlanImageUploadDialog";

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
        .order("is_featured", { ascending: false })
        .order("uploaded_at", { ascending: true })
        .limit(100);
      if (!error && data) setImages(data);
      setImagesLoading(false);
    };
    if (plannerId) fetchImages();
  }, [plannerId]);

  // Add image handler
  const handleImageAdded = async (imageUrl: string) => {
    const { data, error } = await supabase
      .from("plan_images")
      .insert({
        plan_id: plannerId,
        user_id: userId,
        image_url: imageUrl
      })
      .select();
    if (!error && data?.[0]) {
      setImages(images => [data[0], ...images]);
    }
  };

  // Delete image handler
  const handleDeleteImage = async (imageId: string) => {
    setImagesLoading(true);
    await supabase.from("plan_images").delete().eq("id", imageId).eq("plan_id", plannerId);
    setImages(imgs => imgs.filter(i => i.id !== imageId));
    setImagesLoading(false);
  };

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
