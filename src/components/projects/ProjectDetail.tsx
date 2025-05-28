
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Plus } from 'lucide-react';
import { RowCard } from '../rows/RowCard';
import { useToast } from '@/hooks/use-toast';

interface Project {
  id: string;
  name: string;
  hook_size: string;
  yarn_weight: string;
  details?: string;
}

interface ProjectRow {
  id: string;
  position: number;
  instructions: string;
  counter: number;
}

interface ProjectDetailProps {
  project: Project;
  onBack: () => void;
}

export const ProjectDetail = ({ project, onBack }: ProjectDetailProps) => {
  const [rows, setRows] = useState<ProjectRow[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchRows();
  }, [project.id]);

  const fetchRows = async () => {
    try {
      const { data, error } = await supabase
        .from('project_rows')
        .select('*')
        .eq('project_id', project.id)
        .order('position');

      if (error) throw error;
      setRows(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addRow = async () => {
    try {
      const newPosition = rows.length + 1;
      const { data, error } = await supabase
        .from('project_rows')
        .insert({
          project_id: project.id,
          position: newPosition,
          instructions: '',
          counter: 1,
        })
        .select()
        .single();

      if (error) throw error;
      setRows([...rows, data]);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const updateCounter = async (id: string, newCounter: number) => {
    try {
      const { error } = await supabase
        .from('project_rows')
        .update({ counter: newCounter })
        .eq('id', id);

      if (error) throw error;
      setRows(rows.map(row => row.id === id ? { ...row, counter: newCounter } : row));
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const updateInstructions = async (id: string, instructions: string) => {
    try {
      const { error } = await supabase
        .from('project_rows')
        .update({ instructions })
        .eq('id', id);

      if (error) throw error;
      setRows(rows.map(row => row.id === id ? { ...row, instructions } : row));
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const duplicateRow = async (rowToDuplicate: ProjectRow) => {
    try {
      const newPosition = rows.length + 1;
      const { data, error } = await supabase
        .from('project_rows')
        .insert({
          project_id: project.id,
          position: newPosition,
          instructions: rowToDuplicate.instructions,
          counter: 1,
        })
        .select()
        .single();

      if (error) throw error;
      setRows([...rows, data]);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteRow = async (id: string) => {
    try {
      const { error } = await supabase
        .from('project_rows')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      const updatedRows = rows.filter(row => row.id !== id);
      // Reorder positions
      const reorderedRows = updatedRows.map((row, index) => ({
        ...row,
        position: index + 1
      }));
      
      // Update positions in database
      for (const row of reorderedRows) {
        await supabase
          .from('project_rows')
          .update({ position: row.position })
          .eq('id', row.id);
      }
      
      setRows(reorderedRows);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Projects
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{project.name}</CardTitle>
          <div className="text-sm text-gray-600">
            Hook: {project.hook_size} • Yarn Weight: {project.yarn_weight}
          </div>
          {project.details && (
            <p className="text-gray-700 mt-2">{project.details}</p>
          )}
        </CardHeader>
      </Card>

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Rows</h2>
        <Button onClick={addRow}>
          <Plus className="h-4 w-4 mr-2" />
          Add Row
        </Button>
      </div>

      <div className="space-y-3">
        {rows.map((row) => (
          <RowCard
            key={row.id}
            row={row}
            onUpdateCounter={updateCounter}
            onUpdateInstructions={updateInstructions}
            onDuplicate={duplicateRow}
            onDelete={deleteRow}
          />
        ))}
        {rows.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-500">No rows yet. Add your first row to get started!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
