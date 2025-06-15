
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, ExternalLink, Edit, Trash2, Link } from 'lucide-react';
import { usePlanResources } from '@/hooks/usePlanResources';

interface PlanResourcesProps {
  planId: string;
}

interface ResourceFormData {
  url: string;
  title: string;
  description: string;
  resource_type: string;
}

export const PlanResources = ({ planId }: PlanResourcesProps) => {
  const { resources, loading, addResource, updateResource, deleteResource } = usePlanResources(planId);
  const [showDialog, setShowDialog] = useState(false);
  const [editingResource, setEditingResource] = useState<string | null>(null);
  const [formData, setFormData] = useState<ResourceFormData>({
    url: '',
    title: '',
    description: '',
    resource_type: 'pattern',
  });

  const resetForm = () => {
    setFormData({
      url: '',
      title: '',
      description: '',
      resource_type: 'pattern',
    });
    setEditingResource(null);
  };

  const handleOpenDialog = (resourceId?: string) => {
    if (resourceId) {
      const resource = resources.find(r => r.id === resourceId);
      if (resource) {
        setFormData({
          url: resource.url,
          title: resource.title || '',
          description: resource.description || '',
          resource_type: resource.resource_type || 'pattern',
        });
        setEditingResource(resourceId);
      }
    } else {
      resetForm();
    }
    setShowDialog(true);
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    resetForm();
  };

  const handleSubmit = async () => {
    if (!formData.url.trim()) return;

    if (editingResource) {
      await updateResource(editingResource, formData);
    } else {
      await addResource(formData);
    }

    handleCloseDialog();
  };

  const getResourceTypeColor = (type: string) => {
    switch (type) {
      case 'pattern': return 'bg-blue-100 text-blue-800';
      case 'tutorial': return 'bg-green-100 text-green-800';
      case 'inspiration': return 'bg-purple-100 text-purple-800';
      case 'material': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading resources...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Link className="h-5 w-5" />
            Resources & Links
          </CardTitle>
          <Button onClick={() => handleOpenDialog()} size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Add Resource
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {resources.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Link className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No resources added yet</p>
            <p className="text-sm">Add patterns, tutorials, or inspiration links</p>
          </div>
        ) : (
          <div className="space-y-3">
            {resources.map((resource) => (
              <div
                key={resource.id}
                className="p-4 border rounded-lg hover:shadow-sm transition-shadow"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {resource.title && (
                        <h4 className="font-medium">{resource.title}</h4>
                      )}
                      <Badge
                        variant="secondary"
                        className={getResourceTypeColor(resource.resource_type || 'pattern')}
                      >
                        {resource.resource_type || 'pattern'}
                      </Badge>
                    </div>
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1 mb-2"
                    >
                      {resource.url}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                    {resource.description && (
                      <p className="text-sm text-gray-600">{resource.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 ml-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenDialog(resource.id)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteResource(resource.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  Added {new Date(resource.created_at || '').toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add/Edit Resource Dialog */}
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingResource ? 'Edit Resource' : 'Add Resource'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">URL *</label>
                <Input
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://example.com/pattern"
                  type="url"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Resource title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <Select
                  value={formData.resource_type}
                  onValueChange={(value) => setFormData({ ...formData, resource_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pattern">Pattern</SelectItem>
                    <SelectItem value="tutorial">Tutorial</SelectItem>
                    <SelectItem value="inspiration">Inspiration</SelectItem>
                    <SelectItem value="material">Material</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Optional description"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleCloseDialog}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={!formData.url.trim()}>
                {editingResource ? 'Update' : 'Add'} Resource
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};
