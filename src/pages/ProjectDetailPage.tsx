import { useParams } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ProjectDetail } from "@/components/projects/ProjectDetail";
import { ProjectForm } from "@/components/projects/ProjectForm";
import { useProjectDetailPageState } from "@/hooks/useProjectDetailPageState";
import ProjectNotFoundScreen from "@/components/projects/ProjectNotFoundScreen";
import ProjectLoadingScreen from "@/components/projects/ProjectLoadingScreen";
import type { User } from "@supabase/supabase-js";
import { ProjectBreadcrumb } from "@/components/projects/ProjectBreadcrumb";
import { useNavigationContext, NavigationProvider } from "@/context/NavigationContext";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface ProjectDetailPageProps {
  user: User;
}

export const ProjectDetailPage = ({ user }: ProjectDetailPageProps) => {
  const { projectId } = useParams<{ projectId: string }>();
  const location = useLocation();
  const {
    project,
    loading,
    notFound,
    showForm,
    setShowForm,
    formData,
    setFormData,
    handleBack,
    handleProjectDelete,
    handleEditProject,
    handleProjectUpdate,
    handleDuplicate,
    handleFormSubmit,
    handleFormCancel,
    fetchProject,
    handleExportProject,
    handleExportPDF,
  } = useProjectDetailPageState({ projectId, user });

  const { previousPage, setPreviousPage } = useNavigationContext();

  // Default/fallback: "Projects"
  const defaultPrev = { label: "Projects", path: "/projects" };

  // On mount, if coming from a specific location, try to set up the previous page
  useEffect(() => {
    // If we came directly (no referrer) or already set, skip
    if (previousPage) return;
    // Try to use "state" from router if available
    if (location.state && location.state.previousPage) {
      setPreviousPage(location.state.previousPage);
    } else {
      // fallback, e.g. reloaded page, set to "Projects"
      setPreviousPage(defaultPrev);
    }
  }, [location.state, setPreviousPage, previousPage]);

  if (loading) return <ProjectLoadingScreen />;
  if (notFound || !project) return <ProjectNotFoundScreen onBack={handleBack} />;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="mb-4">
        <ProjectBreadcrumb
          prevLabel={previousPage?.label || defaultPrev.label}
          prevPath={previousPage?.path || defaultPrev.path}
          projectName={project.name}
        />
      </div>
      <ProjectDetail
        project={project}
        onBack={handleBack}
        onProjectDelete={handleProjectDelete}
        onProjectExport={() => handleExportProject(project)}
        onProjectExportPDF={() => handleExportPDF(project)}
        onEditProject={handleEditProject}
        onProjectUpdate={handleProjectUpdate}
        onDuplicate={handleDuplicate}
        userId={user.id}
      />

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0">
          <DialogHeader className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <DialogTitle>Edit Project</DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <ProjectForm
              project={project}
              formData={formData}
              onFormDataChange={setFormData}
              userId={user.id}
              showButtons={false}
              onRefreshProjects={fetchProject}
            />
          </div>

          <DialogFooter className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end space-y-reverse space-y-4 sm:space-y-0 sm:space-x-2 w-full">
              <Button type="button" variant="outline" onClick={handleFormCancel}>
                Cancel
              </Button>
              <Button 
                type="button" 
                onClick={handleFormSubmit}
                disabled={!formData.hook_size || !formData.yarn_weight}
              >
                Update Project
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Wrap the ProjectDetailPage with NavigationProvider
const ProjectDetailPageWithProvider = (props: ProjectDetailPageProps) => (
  <NavigationProvider>
    <ProjectDetailPage {...props} />
  </NavigationProvider>
);

export default ProjectDetailPageWithProvider;
