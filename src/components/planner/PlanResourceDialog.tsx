import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface PlanResourceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (resource: { title: string; url: string }) => Promise<void>;
  initialValue?: { title: string; url: string };
  isEditing?: boolean;
}

export default function PlanResourceDialog({
  open,
  onOpenChange,
  onAdd,
  initialValue,
  isEditing,
}: PlanResourceDialogProps) {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open && initialValue) {
      setTitle(initialValue.title);
      setUrl(initialValue.url);
    } else if (open) {
      setTitle("");
      setUrl("");
    }
  }, [open, initialValue]);

  // For forward compatibility, keep a single handler for add/edit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) {
      toast({
        title: "All fields required",
        description: "Please provide a label and link.",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    try {
      await onAdd({
        title: title.trim(),
        url: url.trim().startsWith("http") ? url.trim() : `https://${url.trim()}`,
      });
      // Dialog closed by parent after add/edit
    } catch (err: any) {
      toast({
        title: isEditing ? "Could not update resource" : "Could not add resource",
        description: err?.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Resource" : "Add Resource"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Edit your reference label and link."
              : "Add a helpful link or reference for your plan."}
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block mb-1 font-medium">Label</label>
            <Input
              autoFocus
              placeholder="e.g. Google"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={loading}
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Link</label>
            <Input
              placeholder="e.g. google.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={loading}
              type="url"
              inputMode="url"
              autoCapitalize="none"
              autoCorrect="off"
            />
          </div>
          <DialogFooter>
            <Button
              type="submit"
              disabled={loading || !title.trim() || !url.trim()}
            >
              {isEditing ? "Save Changes" : "Save"}
            </Button>
            <DialogClose asChild>
              <Button type="button" variant="ghost" disabled={loading}>
                Cancel
              </Button>
            </DialogClose>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
