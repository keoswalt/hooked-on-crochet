
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Database } from "@/integrations/supabase/types";
import { useToast } from "@/hooks/use-toast";
import ProjectPreviewCard from "./ProjectPreviewCard";
import { supabase } from "@/integrations/supabase/client";
import { ProjectSearch } from "@/components/projects/ProjectSearch"; // Import the search input

type Project = Database["public"]["Tables"]["projects"]["Row"];

interface ProjectSelectionDialogProps {
  userId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  excludedProjectIds: string[];
  onSelectProjects: (projectIds: string[]) => Promise<void>;
}

export default function ProjectSelectionDialog({
  userId,
  open,
  onOpenChange,
  excludedProjectIds,
  onSelectProjects,
}: ProjectSelectionDialogProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState(""); // NEW: search term state
  const { toast } = useToast();

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    supabase
      .from("projects")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) {
          setProjects(data);
        }
        setLoading(false);
      });
  }, [open, userId]);

  const handleSelect = (projectId: string) => {
    setSelected(prev =>
      prev.includes(projectId)
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId]
    );
  };

  const handleAttach = async () => {
    if (selected.length === 0) {
      toast({
        title: "No Projects Selected",
        description: "Please select at least one project to attach.",
        variant: "destructive",
      });
      return;
    }
    await onSelectProjects(selected);
    setSelected([]);
    onOpenChange(false);
  };

  // Filter projects by search
  const filteredProjects = projects
    .filter((proj) => !excludedProjectIds.includes(proj.id))
    .filter((proj) =>
      !searchTerm
        ? true
        : proj.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          proj.details?.toLowerCase().includes(searchTerm.toLowerCase())
    );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl flex flex-col p-0">
        <DialogHeader className="bg-gray-50 px-6 py-3 border-b border-gray-100">
          <DialogTitle>Attach Projects to Plan</DialogTitle>
        </DialogHeader>
        {/* Sticky search bar with rounded top corners */}
        <div
          className="sticky top-0 z-20 bg-white px-6 pt-4 pb-2 border-b border-gray-100 rounded-t-lg"
          // Remove boxShadow—DialogContent background/rounding will handle it
        >
          <ProjectSearch
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
          />
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-4 min-h-[200px]">
          {loading ? (
            <div className="text-center text-sm text-gray-600">Loading...</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {filteredProjects.map((project) => (
                <ProjectPreviewCard
                  key={project.id}
                  project={project}
                  selected={selected.includes(project.id)}
                  onSelect={() => handleSelect(project.id)}
                />
              ))}
              {filteredProjects.length === 0 && (
                <div className="col-span-full text-sm text-gray-400 py-4">
                  No projects found.
                </div>
              )}
            </div>
          )}
        </div>
        <DialogFooter className="bg-gray-50 px-6 py-3 border-t border-gray-100 flex-row-reverse gap-2">
          <Button type="button" onClick={handleAttach} disabled={selected.length === 0 || loading}>
            Attach Selected
          </Button>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
