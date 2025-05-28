import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AuthForm } from '@/components/auth/AuthForm';
import { Header } from '@/components/layout/Header';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { ProjectForm } from '@/components/projects/ProjectForm';
import { ProjectDetail } from '@/components/projects/ProjectDetail';
import { ProjectSearch } from '@/components/projects/ProjectSearch';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
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

  const handleSaveProject = async (projectData: Omit<Project, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
    try {
      if (editingProject) {
        const { error } = await supabase
          .from('projects')
          .update(projectData)
          .eq('id', editingProject.id);

        if (error) throw error;
        toast({
          title: "Project updated",
          description: "Your project has been updated successfully.",
        });
      } else {
        const { error } = await supabase
          .from('projects')
          .insert({
            ...projectData,
            user_id: user!.id,
          });

        if (error) throw error;
        toast({
          title: "Project created",
          description: "Your new project has been created successfully.",
        });
      }

      setShowForm(false);
      setEditingProject(null);
      fetchProjects();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteProject = async (id: string) => {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({
        title: "Project deleted",
        description: "Your project has been deleted successfully.",
      });
      fetchProjects();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDuplicateProject = async (project: Project) => {
    try {
      // Create new project with same basic info but reset progress
      const { data: newProject, error: projectError } = await supabase
        .from('projects')
        .insert({
          name: `${project.name} (Copy)`,
          hook_size: project.hook_size,
          yarn_weight: project.yarn_weight,
          details: project.details,
          user_id: user!.id,
          is_favorite: false,
        })
        .select()
        .single();

      if (projectError) throw projectError;

      // Get original project rows (only edit mode data)
      const { data: originalRows, error: rowsError } = await supabase
        .from('project_rows')
        .select('type, position, instructions, counter')
        .eq('project_id', project.id)
        .order('position');

      if (rowsError) throw rowsError;

      // Insert rows with only edit mode data, reset make mode data
      if (originalRows && originalRows.length > 0) {
        const rowsToInsert = originalRows.map(row => ({
          project_id: newProject.id,
          type: row.type,
          position: row.position,
          instructions: row.instructions,
          counter: row.counter,
          make_mode_counter: 0,
          make_mode_status: 'not_started',
          is_locked: false,
        }));

        const { error: insertError } = await supabase
          .from('project_rows')
          .insert(rowsToInsert);

        if (insertError) throw insertError;
      }

      toast({
        title: "Project duplicated",
        description: "Your project has been duplicated successfully.",
      });
      fetchProjects();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleToggleFavorite = async (id: string, isFavorite: boolean) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({ is_favorite: isFavorite })
        .eq('id', id);

      if (error) throw error;
      
      setProjects(projects.map(project => 
        project.id === id ? { ...project, is_favorite: isFavorite } : project
      ));
      
      toast({
        title: isFavorite ? "Added to favorites" : "Removed from favorites",
        description: `Project has been ${isFavorite ? 'added to' : 'removed from'} your favorites.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setShowForm(true);
  };

  const handleDeleteProjectFromDetail = () => {
    if (selectedProject) {
      handleDeleteProject(selectedProject.id);
      setSelectedProject(null);
    }
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
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
        <AuthForm mode={authMode} onModeChange={setAuthMode} />
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
          />
        </main>
      </div>
    );
  }

  if (showForm) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header userEmail={user.email} />
        <main className="container mx-auto px-4 py-8">
          <ProjectForm
            project={editingProject || undefined}
            onSave={handleSaveProject}
            onCancel={() => {
              setShowForm(false);
              setEditingProject(null);
            }}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header userEmail={user.email} />
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold text-gray-900">My Crochet Projects</h1>
          <div className="flex items-center gap-4">
            <ProjectSearch 
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
            />
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <div key={project.id} onClick={() => setSelectedProject(project)} className="cursor-pointer">
              <ProjectCard
                project={project}
                onEdit={(e) => {
                  e.stopPropagation();
                  handleEditProject(project);
                }}
                onDelete={(id) => {
                  handleDeleteProject(id);
                }}
                onDuplicate={(e) => {
                  e.stopPropagation();
                  handleDuplicateProject(project);
                }}
                onToggleFavorite={handleToggleFavorite}
              />
            </div>
          ))}
        </div>

        {filteredProjects.length === 0 && !searchTerm && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-4">No projects yet!</p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Project
            </Button>
          </div>
        )}

        {filteredProjects.length === 0 && searchTerm && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-4">No projects found matching "{searchTerm}"</p>
            <Button onClick={() => setSearchTerm('')} variant="outline">
              Clear Search
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
