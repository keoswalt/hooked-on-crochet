
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Plus, Palette, Package } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import type { User } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

type PlannerProject = Database['public']['Tables']['planner_projects']['Row'];
type YarnStash = Database['public']['Tables']['yarn_stash']['Row'];
type Swatch = Database['public']['Tables']['swatches']['Row'];

interface PlannerPageProps {
  user: User;
}

export const PlannerPage = ({ user }: PlannerPageProps) => {
  const [plannerProjects, setPlannerProjects] = useState<PlannerProject[]>([]);
  const [yarnStash, setYarnStash] = useState<YarnStash[]>([]);
  const [swatches, setSwatches] = useState<Swatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewProjectDialog, setShowNewProjectDialog] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, [user.id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch planner projects
      const { data: projects, error: projectsError } = await supabase
        .from('planner_projects')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (projectsError) throw projectsError;
      setPlannerProjects(projects || []);

      // Fetch yarn stash (limit to recent entries for overview)
      const { data: yarn, error: yarnError } = await supabase
        .from('yarn_stash')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(6);

      if (yarnError) throw yarnError;
      setYarnStash(yarn || []);

      // Fetch swatches (limit to recent entries for overview)
      const { data: swatchData, error: swatchError } = await supabase
        .from('swatches')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(6);

      if (swatchError) throw swatchError;
      setSwatches(swatchData || []);

    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load planner data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return;

    try {
      const { data, error } = await supabase
        .from('planner_projects')
        .insert({
          name: newProjectName,
          description: newProjectDescription,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Project created successfully",
      });

      setShowNewProjectDialog(false);
      setNewProjectName('');
      setNewProjectDescription('');
      navigate(`/planner/${data.id}`);
    } catch (error: any) {
      console.error('Error creating project:', error);
      toast({
        title: "Error",
        description: "Failed to create project",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Project Planner</h1>
          <p className="text-gray-600 mt-2">Plan your crochet projects with an infinite canvas</p>
        </div>
        <Button onClick={() => setShowNewProjectDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Planner Project
        </Button>
      </div>

      {/* Projects Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Your Planner Projects</h2>
        {plannerProjects.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Palette className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No planner projects yet. Create your first one!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plannerProjects.map((project) => (
              <Card key={project.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(`/planner/${project.id}`)}>
                <CardHeader>
                  <CardTitle>{project.name}</CardTitle>
                  {project.description && (
                    <CardDescription>{project.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500">
                    Last modified: {new Date(project.updated_at).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Quick Overview Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Yarn Stash Overview */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Recent Yarn</h2>
            <Button variant="outline" size="sm">
              <Package className="h-4 w-4 mr-2" />
              Manage Stash
            </Button>
          </div>
          {yarnStash.length === 0 ? (
            <Card>
              <CardContent className="text-center py-6">
                <p className="text-gray-600">No yarn in your stash yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {yarnStash.map((yarn) => (
                <Card key={yarn.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between">
                      <div>
                        <p className="font-medium">{yarn.name}</p>
                        <p className="text-sm text-gray-600">{yarn.brand} - {yarn.color}</p>
                      </div>
                      <div className="text-right text-sm text-gray-500">
                        {yarn.remaining_yardage}/{yarn.yardage} yds
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Swatches Overview */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Recent Swatches</h2>
            <Button variant="outline" size="sm">
              Manage Swatches
            </Button>
          </div>
          {swatches.length === 0 ? (
            <Card>
              <CardContent className="text-center py-6">
                <p className="text-gray-600">No swatches created yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {swatches.map((swatch) => (
                <Card key={swatch.id}>
                  <CardContent className="p-4">
                    <p className="font-medium">{swatch.title}</p>
                    <p className="text-sm text-gray-600">{swatch.description}</p>
                    {swatch.hook_size && (
                      <p className="text-xs text-gray-500 mt-1">Hook: {swatch.hook_size}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* New Project Dialog */}
      <Dialog open={showNewProjectDialog} onOpenChange={setShowNewProjectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Planner Project</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label htmlFor="project-name" className="block text-sm font-medium mb-2">
                Project Name
              </label>
              <Input
                id="project-name"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="Enter project name"
              />
            </div>
            <div>
              <label htmlFor="project-description" className="block text-sm font-medium mb-2">
                Description (optional)
              </label>
              <Textarea
                id="project-description"
                value={newProjectDescription}
                onChange={(e) => setNewProjectDescription(e.target.value)}
                placeholder="Describe your project"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewProjectDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateProject} disabled={!newProjectName.trim()}>
              Create Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
