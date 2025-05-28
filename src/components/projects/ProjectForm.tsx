
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X } from 'lucide-react';

interface Project {
  id?: string;
  name: string;
  hook_size: string;
  yarn_weight: string;
  details?: string;
}

interface ProjectFormProps {
  project?: Project;
  onSave: (project: Omit<Project, 'id'>) => void;
  onCancel: () => void;
}

const hookSizes = ['2mm', '2.2mm', '3mm', '3.5mm', '4mm', '4.5mm', '5mm', '5.5mm', '6mm', '6.5mm', '9mm', '10mm'];
const yarnWeights = ['0', '1', '2', '3', '4', '5', '6', '7'];

export const ProjectForm = ({ project, onSave, onCancel }: ProjectFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    hook_size: '',
    yarn_weight: '',
    details: '',
  });

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name,
        hook_size: project.hook_size,
        yarn_weight: project.yarn_weight,
        details: project.details || '',
      });
    }
  }, [project]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>{project ? 'Edit Project' : 'New Project'}</CardTitle>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Project Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="hook_size">Hook Size</Label>
            <Select value={formData.hook_size} onValueChange={(value) => setFormData({ ...formData, hook_size: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select hook size" />
              </SelectTrigger>
              <SelectContent>
                {hookSizes.map((size) => (
                  <SelectItem key={size} value={size}>{size}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="yarn_weight">Yarn Weight</Label>
            <Select value={formData.yarn_weight} onValueChange={(value) => setFormData({ ...formData, yarn_weight: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select yarn weight" />
              </SelectTrigger>
              <SelectContent>
                {yarnWeights.map((weight) => (
                  <SelectItem key={weight} value={weight}>{weight}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="details">Details</Label>
            <textarea
              id="details"
              value={formData.details}
              onChange={(e) => setFormData({ ...formData, details: e.target.value })}
              className="w-full p-2 border rounded-md min-h-[100px] resize-none"
              placeholder="Add project details, notes, or pattern information..."
            />
          </div>

          <div className="flex space-x-2">
            <Button type="submit" className="flex-1">
              {project ? 'Update Project' : 'Create Project'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
