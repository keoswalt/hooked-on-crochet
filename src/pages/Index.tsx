import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AuthForm } from '@/components/auth/AuthForm';
import { Header } from '@/components/layout/Header';
import { ProjectForm } from '@/components/projects/ProjectForm';
import { ProjectDetail } from '@/components/projects/ProjectDetail';
import { ProjectSearch } from '@/components/projects/ProjectSearch';
import { ProjectGrid } from '@/components/projects/ProjectGrid';
import { ProjectImporter } from '@/components/projects/ProjectImporter';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useProjectOperations } from '@/hooks/useProjectOperations';
import type { User } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

type Project = Database['public']['Tables']['projects']['Row'];

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [projects, setProjects] = useState<Project[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user]);

  // Check for project URL parameter when projects are loaded
  useEffect(() => {
    if (projects.length > 0 && user) {
      const urlParams = new URLSearchParams(window.location.search);
      const projectId = urlParams.get('project');
      
      if (projectId && !selectedProject) {
        const project = projects.find(p => p.id === projectId);
        if (project) {
          setSelectedProject(project);
          // Clear URL parameter after selecting project
          window.history.replaceState({}, '', window.location.pathname);
        }
      }
    }
  }, [projects, user, selectedProject]);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const {
    loading: operationsLoading,
    handleSaveProject,
    handleDeleteProject,
    handleDuplicateProject,
    handleToggleFavorite,
    handleExportProject,
    handleExportPDF,
    handleImportProject,
  } = useProjectOperations(user, fetchProjects);

  // Filter and sort projects based on search term and favorites
  const filteredProjects = useMemo(() => {
    let filtered = projects;
    
    if (searchTerm.trim()) {
      filtered = projects.filter(project =>
        project.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Sort by favorite status first, then by updated_at
    return filtered.sort((a, b) => {
      if (a.is_favorite && !b.is_favorite) return -1;
      if (!a.is_favorite && b.is_favorite) return 1;
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    });
  }, [projects, searchTerm]);

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setShowForm(true);
    // Don't clear selectedProject when editing - keep the user in detail view
  };

  const handleDeleteProjectFromDetail = () => {
    if (selectedProject) {
      handleDeleteProject(selectedProject.id);
      setSelectedProject(null);
    }
  };

  const handleSave = async (projectData: Omit<Project, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
    await handleSaveProject(projectData, editingProject);
    setShowForm(false);
    setEditingProject(null);
    // Don't clear selectedProject - this will keep us in the detail view if we were editing from there
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingProject(null);
    // Don't clear selectedProject - this will keep us in the detail view if we were editing from there
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 sm:bg-gradient-to-br sm:from-green-50 sm:to-green-100 flex items-center justify-center">
        <AuthForm mode={authMode} onModeChange={setAuthMode} />
      </div>
    );
  }

  // Prioritize form over project detail
  if (showForm) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header userEmail={user.email} />
        <main className="container mx-auto px-4 py-8">
          <ProjectForm
            project={editingProject || undefined}
            onSave={handleSave}
            onCancel={handleFormCancel}
          />
        </main>
      </div>
    );
  }

  if (selectedProject) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header userEmail={user.email} />
        <main className="container mx-auto px-4 py-8">
          <ProjectDetail 
            project={selectedProject} 
            onBack={() => setSelectedProject(null)}
            onProjectDelete={handleDeleteProjectFromDetail}
            onProjectExport={() => handleExportProject(selectedProject)}
            onProjectExportPDF={() => handleExportPDF(selectedProject)}
            onEditProject={handleEditProject}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header userEmail={user.email} />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
            <h1 className="text-3xl font-bold text-gray-900">My Crochet Projects</h1>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <ProjectSearch 
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
              />
              <div className="flex gap-2">
                <ProjectImporter 
                  onImport={handleImportProject}
                  loading={operationsLoading}
                />
                <Button onClick={() => setShowForm(true)} className="whitespace-nowrap">
                  <Plus className="h-4 w-4 mr-2" />
                  New Project
                </Button>
              </div>
            </div>
          </div>
        </div>

        <ProjectGrid
          projects={filteredProjects}
          searchTerm={searchTerm}
          onEditProject={handleEditProject}
          onDeleteProject={handleDeleteProject}
          onDuplicateProject={handleDuplicateProject}
          onToggleFavorite={handleToggleFavorite}
          onCardClick={setSelectedProject}
          onCreateProject={() => setShowForm(true)}
          onClearSearch={() => setSearchTerm('')}
        />
      </main>
    </div>
  );
};

export default Index;
