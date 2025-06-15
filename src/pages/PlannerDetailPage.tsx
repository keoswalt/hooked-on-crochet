import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import type { Database } from "@/integrations/supabase/types";
import type { User } from "@supabase/supabase-js";
import PlannerTitleSection from "@/components/planner/PlannerTitleSection";
import PlannerSection from "@/components/planner/PlannerSection";
import { Textarea } from "@/components/ui/textarea";
type Plan = Database['public']['Tables']['plans']['Row'];

export const PlannerDetailPage = ({
  user
}: { user: User }) => {
  const { plannerId } = useParams();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [editableName, setEditableName] = useState("");
  const [editableDesc, setEditableDesc] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const debouncedSaveTimeout = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

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
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/planner">Planner</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{plan.name || "..."}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

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
      <PlannerSection
        title="Images"
        buttonText="Add Image"
        buttonDisabled
      >
        <div className="border rounded-md py-6 px-4 flex items-center justify-center text-muted-foreground min-h-[64px]">
          Feature coming soon: upload images for your plan.
        </div>
      </PlannerSection>

      {/* RESOURCES SECTION */}
      <PlannerSection
        title="Resources"
        buttonText="Add Resource"
        buttonDisabled
      >
        <div className="border rounded-md py-6 px-4 flex items-center justify-center text-muted-foreground min-h-[64px]">
          Feature coming soon: add and view resources.
        </div>
      </PlannerSection>

      {/* YARN SECTION */}
      <PlannerSection
        title="Yarn"
        buttonText="Add Yarn"
        buttonDisabled
      >
        <div className="border rounded-md py-6 px-4 flex items-center justify-center text-muted-foreground min-h-[64px]">
          Feature coming soon: attach yarn from your stash.
        </div>
      </PlannerSection>

      {/* SWATCHES SECTION */}
      <PlannerSection
        title="Swatches"
        buttonText="Add Swatch"
        buttonDisabled
      >
        <div className="border rounded-md py-6 px-4 flex items-center justify-center text-muted-foreground min-h-[64px]">
          Feature coming soon: attach swatches.
        </div>
      </PlannerSection>

      {/* NOTES SECTION */}
      <PlannerSection
        title="Notes"
        buttonText="Add Note"
        buttonDisabled
      >
        <div>
          <Textarea
            placeholder="Jot down notes about your plan..."
            rows={3}
            disabled
            className="resize-none bg-gray-50"
          />
        </div>
      </PlannerSection>
    </div>
  );
};

export default PlannerDetailPage;
