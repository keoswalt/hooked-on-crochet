import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, CheckCircle2, XCircle } from "lucide-react";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import type { Database } from "@/integrations/supabase/types";
import type { User } from "@supabase/supabase-js";
type Plan = Database['public']['Tables']['plans']['Row'];
export const PlannerDetailPage = ({
  user
}: {
  user: User;
}) => {
  const {
    plannerId
  } = useParams();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [editableName, setEditableName] = useState("");
  const [editableDesc, setEditableDesc] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const debouncedSaveTimeout = useRef<NodeJS.Timeout | null>(null);
  const {
    toast
  } = useToast();
  const navigate = useNavigate();

  // fetch plan logic (unchanged)
  useEffect(() => {
    const fetchPlan = async () => {
      setLoading(true);
      try {
        const {
          data,
          error
        } = await supabase.from("plans").select("*").eq("id", plannerId).eq("user_id", user.id).maybeSingle();
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
  }, [plannerId, user.id]); // do not depend on toast/navigate, as previously

  // Debounced save effect
  useEffect(() => {
    if (!plan) return;
    // If nothing changed from what's in the db, do not save
    if (editableName === plan.name && editableDesc === (plan.description || "")) {
      return;
    }

    // Clear previous error/success
    setSaveError(null);
    setSaveSuccess(false);

    // Set up debounce
    if (debouncedSaveTimeout.current) clearTimeout(debouncedSaveTimeout.current);
    setSaving(true);
    debouncedSaveTimeout.current = setTimeout(() => {
      savePlanFields();
    }, 1000);

    // Cleanup on unmount
    return () => {
      if (debouncedSaveTimeout.current) clearTimeout(debouncedSaveTimeout.current);
    };
    // eslint-disable-next-line
  }, [editableName, editableDesc]);

  // Save on blur in case user clicks away quickly
  const handleFieldBlur = () => {
    if (!plan) return;
    // Only save if there are changes and if debounce hasn't already triggered a save
    if (editableName === plan.name && editableDesc === (plan.description || "")) return;
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
      const {
        error
      } = await supabase.from("plans").update({
        name: editableName,
        description: editableDesc
      }).eq("id", plan.id);
      if (error) throw error;
      setPlan({
        ...plan,
        name: editableName,
        description: editableDesc
      });
      setSaveSuccess(true);
      toast({
        title: "Saved",
        description: "Plan updated successfully."
      });
    } catch (err: any) {
      setSaveError(err.message);
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setSaving(false);
      // Reset success after 2s
      setTimeout(() => setSaveSuccess(false), 2000);
    }
  };
  if (loading) {
    return <div className="min-h-[40vh] flex items-center justify-center">
        <Loader2 className="animate-spin h-6 w-6 text-gray-400" />
      </div>;
  }
  if (!plan) return null;
  return <div className="w-full px-2 md:px-6 py-8">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/planner">Planner</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{plan.name || "..."}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Page Header and Edit Fields */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mt-6 mb-8">
        <div className="flex-1 max-w-2xl">
          <div className="relative">
            <Input value={editableName} onChange={e => setEditableName(e.target.value)} onBlur={handleFieldBlur} disabled={loading} maxLength={100} placeholder="Plan Name" className="text-4xl lg:text-5xl font-extrabold leading-tight tracking-tight px-0 border-none shadow-none bg-transparent focus:ring-0 focus:outline-none mb-4 " />
            {/* Show auto-save status */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {saving && <Loader2 className="animate-spin h-5 w-5 text-gray-300" />}
              {saveSuccess && !saving && <CheckCircle2 className="h-5 w-5 text-green-500" />}
              {saveError && !saving && <XCircle className="h-5 w-5 text-red-500" />}
            </div>
          </div>
          <Textarea value={editableDesc} onChange={e => setEditableDesc(e.target.value)} onBlur={handleFieldBlur} placeholder="Description" rows={2} disabled={loading} maxLength={400} className="mt-2 resize-none border-none bg-transparent shadow-none p-0 text-base focus:ring-0 focus:outline-none" />
        </div>
      </div>

      {/* IMAGES SECTION */}
      <section className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <h2 className="font-semibold text-lg">Images</h2>
          <Button size="sm" variant="outline">
            <Plus className="w-4 h-4 mr-1" />
            Add Image
          </Button>
        </div>
        <div className="border rounded-md py-6 px-4 flex items-center justify-center text-muted-foreground min-h-[64px]">
          Feature coming soon: upload images for your plan.
        </div>
      </section>
      {/* RESOURCES SECTION */}
      <section className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <h2 className="font-semibold text-lg">Resources</h2>
          <Button size="sm" variant="outline">
            <Plus className="w-4 h-4 mr-1" />
            Add Resource
          </Button>
        </div>
        <div className="border rounded-md py-6 px-4 flex items-center justify-center text-muted-foreground min-h-[64px]">
          Feature coming soon: add and view resources.
        </div>
      </section>
      {/* YARN SECTION */}
      <section className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <h2 className="font-semibold text-lg">Yarn</h2>
          <Button size="sm" variant="outline">
            <Plus className="w-4 h-4 mr-1" />
            Add Yarn
          </Button>
        </div>
        <div className="border rounded-md py-6 px-4 flex items-center justify-center text-muted-foreground min-h-[64px]">
          Feature coming soon: attach yarn from your stash.
        </div>
      </section>
      {/* SWATCHES SECTION */}
      <section className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <h2 className="font-semibold text-lg">Swatches</h2>
          <Button size="sm" variant="outline">
            <Plus className="w-4 h-4 mr-1" />
            Add Swatch
          </Button>
        </div>
        <div className="border rounded-md py-6 px-4 flex items-center justify-center text-muted-foreground min-h-[64px]">
          Feature coming soon: attach swatches.
        </div>
      </section>
      {/* NOTES SECTION */}
      <section className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <h2 className="font-semibold text-lg">Notes</h2>
          <Button size="sm" variant="outline">
            <Plus className="w-4 h-4 mr-1" />
            Add Note
          </Button>
        </div>
        <div>
          <Textarea placeholder="Jot down notes about your plan..." rows={3} disabled className="resize-none bg-gray-50" />
        </div>
      </section>
    </div>;
};
export default PlannerDetailPage;