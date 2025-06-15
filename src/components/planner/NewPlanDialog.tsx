
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface NewPlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (planId: string) => void;
  userId: string;
}

export const NewPlanDialog = ({ open, onOpenChange, onCreated, userId }: NewPlanDialogProps) => {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleCreate = async () => {
    if (!name.trim()) {
      toast({ title: "Name required", description: "Please provide a plan name.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("plans")
        .insert([{ user_id: userId, name, description: desc }])
        .select("id")
        .maybeSingle();

      if (error || !data) throw error || new Error("No plan returned");

      toast({ title: "Plan created", description: `"${name}" is ready!` });
      setName("");
      setDesc("");
      onOpenChange(false);
      onCreated(data.id);
    } catch (err: any) {
      toast({ title: "Error creating plan", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Plan</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder="Plan name"
            value={name}
            onChange={e => setName(e.target.value)}
            autoFocus
            disabled={loading}
            maxLength={100}
          />
          <Textarea
            placeholder="Optional description"
            value={desc}
            onChange={e => setDesc(e.target.value)}
            rows={3}
            disabled={loading}
            maxLength={400}
          />
        </div>
        <DialogFooter>
          <Button onClick={handleCreate} disabled={loading || !name.trim()}>{loading ? "Creating..." : "Create"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
