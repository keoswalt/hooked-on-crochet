
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import type { Database } from "@/integrations/supabase/types";
import type { User } from "@supabase/supabase-js";
import PlannerTitleSection from "@/components/planner/PlannerTitleSection";
import PlannerSection from "@/components/planner/PlannerSection";
import PlannerBreadcrumb from "@/components/planner/PlannerBreadcrumb";
import PlannerImagesSection from "@/components/planner/PlannerImagesSection";
import PlannerResourcesSection from "@/components/planner/PlannerResourcesSection";
import PlannerYarnSection from "@/components/planner/PlannerYarnSection";
import PlannerSwatchesSection from "@/components/planner/PlannerSwatchesSection";
import PlannerProjectsSection from "@/components/planner/PlannerProjectsSection";
import PlannerNotesSection from "@/components/planner/PlannerNotesSection";
import { Textarea } from "@/components/ui/textarea";
import PlanImageUploadDialog from "@/components/planner/PlanImageUploadDialog";
import PlanImagesGrid from "@/components/planner/PlanImagesGrid";
import EmptyState from "@/components/ui/EmptyState";
import { useNavigationContext } from "@/context/NavigationContext";

type Plan = Database['public']['Tables']['plans']['Row'];

export const PlannerDetailPage = ({
  user
}: { user: any }) => {
  const { setPreviousPage } = useNavigationContext();
  const navigate = useNavigate();
  const { plannerId } = useParams();
  // You'll likely have planName from your plan detail data
  // Imagine 'planName' is available here
  const planName = "Plan"; // Replace with actual plan name

  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [editableName, setEditableName] = useState("");
  const [editableDesc, setEditableDesc] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const debouncedSaveTimeout = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  // Images state
  const [images, setImages] = useState<any[]>([]);
  const [imagesLoading, setImagesLoading] = useState(true);
  const [showImagesUpload, setShowImagesUpload] = useState(false);

  useEffect(() => {
    const fetchPlan = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("plans")
          .select("*")
          .eq("id", plannerId)
          .eq("user_id", user.id)
          .maybeSingle();
        if (error) throw error;
        setPlan(data);
        setEditableName(data?.name || "");
        setEditableDesc(data?.description || "");
      } catch (err: any) {
        toast({
          title: "Not found",
          description: "This plan does not exist or you don't have access.",
          variant: "destructive"
        });
        navigate("/planner");
      } finally {
        setLoading(false);
      }
    };
    if (plannerId) fetchPlan();
    // eslint-disable-next-line
  }, [plannerId, user.id]);

  useEffect(() => {
    if (!plan) return;
    if (
      editableName === plan.name &&
      editableDesc === (plan.description || "")
    ) {
      return;
    }
    setSaveError(null);
    setSaveSuccess(false);
    if (debouncedSaveTimeout.current) clearTimeout(debouncedSaveTimeout.current);
    setSaving(true);
    debouncedSaveTimeout.current = setTimeout(() => {
      savePlanFields();
    }, 1000);
    return () => {
      if (debouncedSaveTimeout.current) clearTimeout(debouncedSaveTimeout.current);
    };
    // eslint-disable-next-line
  }, [editableName, editableDesc]);

  // Save on blur in case user clicks away quickly
  const handleFieldBlur = () => {
    if (!plan) return;
    if (
      editableName === plan.name &&
      editableDesc === (plan.description || "")
    )
      return;
    if (debouncedSaveTimeout.current) {
      clearTimeout(debouncedSaveTimeout.current);
      debouncedSaveTimeout.current = null;
      savePlanFields();
    }
  };

  const savePlanFields = async () => {
    if (!plan) return;
    setSaving(true);
    setSaveError(null);
    try {
      const { error } = await supabase
        .from("plans")
        .update({
          name: editableName,
          description: editableDesc,
        })
        .eq("id", plan.id);
      if (error) throw error;
      setPlan({
        ...plan,
        name: editableName,
        description: editableDesc,
      });
      setSaveSuccess(true);
      toast({
        title: "Saved",
        description: "Plan updated successfully.",
      });
    } catch (err: any) {
      setSaveError(err.message);
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
      setTimeout(() => setSaveSuccess(false), 2000);
    }
  };

  // Fetch images
  useEffect(() => {
    const fetchImages = async () => {
      if (!plannerId) return;
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
    fetchImages();
  }, [plannerId]);

  // Add image handler
  const handleImageAdded = async (imageUrl: string) => {
    if (!plannerId || !user?.id) return;
    // Insert in DB
    const { data, error } = await supabase
      .from("plan_images")
      .insert({
        plan_id: plannerId,
        user_id: user.id,
        image_url: imageUrl
      })
      .select();
    if (!error && data?.[0]) {
      setImages(images => [data[0], ...images]);
    }
  };

  // Delete image handler
  const handleDeleteImage = async (imageId: string) => {
    if (!plannerId) return;
    setImagesLoading(true);
    await supabase.from("plan_images").delete().eq("id", imageId).eq("plan_id", plannerId);
    setImages(imgs => imgs.filter(i => i.id !== imageId));
    setImagesLoading(false);
  };

  // DO NOT pass onCardClick to PlannerProjectsSection (API doesn't support it), so remove this
  // If you need custom navigation, add the prop to PlannerProjectsSection and the usage/component as needed

  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <Loader2 className="animate-spin h-6 w-6 text-gray-400" />
      </div>
    );
  }
  if (!plan) return null;

  return (
    <div className="w-full px-2 md:px-6 py-8">
      {/* Breadcrumb */}
      <PlannerBreadcrumb planName={plan.name || "..."} />

      {/* Page Header and Edit Fields */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mt-6 mb-8">
        <PlannerTitleSection
          editableName={editableName}
          setEditableName={setEditableName}
          editableDesc={editableDesc}
          setEditableDesc={setEditableDesc}
          loading={loading}
          handleFieldBlur={handleFieldBlur}
          saving={saving}
          saveSuccess={saveSuccess}
          saveError={saveError}
        />
      </div>

      {/* IMAGES SECTION */}
      <PlannerImagesSection plannerId={plannerId as string} userId={user.id} />

      {/* RESOURCES SECTION */}
      <PlannerResourcesSection plannerId={plannerId as string} userId={user.id} />

      {/* YARN SECTION */}
      <PlannerYarnSection plannerId={plannerId as string} userId={user.id} />

      {/* SWATCHES SECTION */}
      <PlannerSwatchesSection plannerId={plannerId as string} userId={user.id} />

      {/* PROJECTS SECTION */}
      <PlannerProjectsSection plannerId={plannerId as string} user={user} />

      {/* NOTES SECTION */}
      <PlannerNotesSection
        // @ts-expect-error -- notes section may be missing prop types, but these should match usage in other planner sections
        plannerId={plannerId as string}
        userId={user.id}
      />
    </div>
  );
};

export default PlannerDetailPage;
