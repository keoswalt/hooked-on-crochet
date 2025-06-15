
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";
import type { User } from "@supabase/supabase-js";

type Plan = Database['public']['Tables']['plans']['Row'];

export const PlannerDetailPage = ({ user }: { user: User }) => {
  const { plannerId } = useParams();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [editableName, setEditableName] = useState("");
  const [editableDesc, setEditableDesc] = useState("");
  const [saving, setSaving] = useState(false);
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
        toast({ title: "Not found", description: "This plan does not exist or you don't have access.", variant: "destructive" });
        navigate("/planner");
      } finally {
        setLoading(false);
      }
    };
    if (plannerId) fetchPlan();
  }, [plannerId, user.id, toast, navigate]);

  const handleSave = async () => {
    if (!plan) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("plans")
        .update({ name: editableName, description: editableDesc })
        .eq("id", plan.id);
      if (error) throw error;
      setPlan({ ...plan, name: editableName, description: editableDesc });
      toast({ title: "Saved", description: "Plan updated successfully." });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
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
    <div className="container max-w-4xl mx-auto py-8">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Edit Plan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3">
            <Input
              value={editableName}
              onChange={e => setEditableName(e.target.value)}
              disabled={saving}
              maxLength={100}
            />
            <Textarea
              value={editableDesc}
              onChange={e => setEditableDesc(e.target.value)}
              placeholder="Description"
              rows={3}
              disabled={saving}
              maxLength={400}
            />
            <div>
              <Button onClick={handleSave} disabled={saving || !editableName.trim()} size="sm">
                {saving ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mb-8">
        <h2 className="font-semibold text-lg mb-2">Images</h2>
        <div className="border p-4 rounded-md bg-gray-50">
          {/* TODO: PlanImageManager */}
          <span className="text-muted-foreground">Feature coming soon: upload images for your plan.</span>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="font-semibold text-lg mb-2">Resources</h2>
        <div className="border p-4 rounded-md bg-gray-50">
          {/* TODO: PlanResourceManager */}
          <span className="text-muted-foreground">Feature coming soon: add and view resources.</span>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="font-semibold text-lg mb-2">Yarn</h2>
        <div className="border p-4 rounded-md bg-gray-50">
          {/* TODO: PlanYarnManager */}
          <span className="text-muted-foreground">Feature coming soon: attach yarn from your stash.</span>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="font-semibold text-lg mb-2">Swatches</h2>
        <div className="border p-4 rounded-md bg-gray-50">
          {/* TODO: PlanSwatchManager */}
          <span className="text-muted-foreground">Feature coming soon: attach swatches.</span>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="font-semibold text-lg mb-2">Notes</h2>
        <div className="border p-4 rounded-md bg-gray-50">
          {/* TODO: Open text field to capture planning notes */}
          <span className="text-muted-foreground">Feature coming soon: jot down notes about your plan.</span>
        </div>
      </div>
    </div>
  );
};

export default PlannerDetailPage;
