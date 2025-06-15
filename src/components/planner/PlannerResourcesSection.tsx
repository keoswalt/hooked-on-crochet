
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import PlannerSection from "./PlannerSection";
import EmptyState from "@/components/ui/EmptyState";
import PlanResourceDialog from "./PlanResourceDialog";
import PlanResourceCard from "./PlanResourceCard";

interface PlanResource {
  id: string;
  title: string;
  url: string;
}

interface PlannerResourcesSectionProps {
  plannerId: string;
  userId: string;
}

const PlannerResourcesSection = ({
  plannerId,
  userId,
}: PlannerResourcesSectionProps) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [editingResource, setEditingResource] = useState<PlanResource | null>(null);
  const [resources, setResources] = useState<PlanResource[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch resources
  useEffect(() => {
    async function fetchResources() {
      setLoading(true);
      const { data, error } = await supabase
        .from("plan_resources")
        .select("id, title, url")
        .eq("plan_id", plannerId)
        .order("created_at", { ascending: true });
      if (error) {
        toast({
          title: "Failed to load resources",
          description: error.message,
          variant: "destructive",
        });
      } else {
        setResources(data as PlanResource[]);
      }
      setLoading(false);
    }
    if (plannerId) fetchResources();
    // eslint-disable-next-line
  }, [plannerId]);

  const handleAdd = async ({
    title,
    url,
  }: {
    title: string;
    url: string;
  }) => {
    const { data, error } = await supabase
      .from("plan_resources")
      .insert({
        plan_id: plannerId,
        user_id: userId,
        title,
        url,
      })
      .select("id, title, url");
    if (error || !data?.[0]) {
      throw new Error(error?.message || "Could not add resource");
    }
    setResources((rs) => [...rs, data[0]]);
    toast({
      title: "Resource added",
      description: "Your resource was added successfully.",
    });
  };

  const handleEdit = async ({
    id,
    title,
    url,
  }: {
    id: string;
    title: string;
    url: string;
  }) => {
    const { error } = await supabase
      .from("plan_resources")
      .update({
        title,
        url,
      })
      .eq("id", id)
      .eq("plan_id", plannerId)
      .select("id, title, url");
    if (error) {
      throw new Error(error?.message || "Could not update resource");
    }
    setResources((rs) =>
      rs.map((r) => (r.id === id ? { ...r, title, url } : r))
    );
    toast({
      title: "Resource updated",
      description: "Resource was updated successfully.",
    });
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from("plan_resources")
      .delete()
      .eq("id", id)
      .eq("plan_id", plannerId);
    if (error) {
      toast({
        title: "Could not delete",
        description: error.message,
        variant: "destructive",
      });
      return;
    }
    setResources((rs) => rs.filter((r) => r.id !== id));
    toast({
      title: "Resource deleted",
    });
  };

  // Unified dialog close handler
  const handleDialogClose = () => {
    setOpenDialog(false);
    setEditingResource(null);
  };

  // Handle save from dialog: add or edit based on editingResource presence
  const handleDialogSave = async (resource: { title: string; url: string }) => {
    if (editingResource) {
      await handleEdit({
        id: editingResource.id,
        title: resource.title,
        url: resource.url,
      });
    } else {
      await handleAdd(resource);
    }
    handleDialogClose();
  };

  return (
    <PlannerSection
      title="Resources"
      buttonText="Add Resource"
      buttonDisabled={false}
      onAdd={() => {
        setOpenDialog(true);
        setEditingResource(null);
      }}
    >
      {loading ? (
        <div className="py-6 text-muted-foreground">Loading...</div>
      ) : resources.length === 0 ? (
        <EmptyState>
          No resources yet. Use "Add Resource" to attach helpful links.
        </EmptyState>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {resources.map((res) => (
            <PlanResourceCard
              key={res.id}
              title={res.title}
              url={res.url}
              onDelete={() => handleDelete(res.id)}
              onEdit={() => {
                setEditingResource(res);
                setOpenDialog(true);
              }}
            />
          ))}
        </div>
      )}
      <PlanResourceDialog
        open={openDialog}
        onOpenChange={(open) => {
          setOpenDialog(open);
          if (!open) setEditingResource(null);
        }}
        onAdd={handleDialogSave}
        initialValue={
          editingResource
            ? { title: editingResource.title, url: editingResource.url }
            : undefined
        }
        isEditing={!!editingResource}
      />
    </PlannerSection>
  );
};

export default PlannerResourcesSection;
