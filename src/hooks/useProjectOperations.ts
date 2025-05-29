import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import type { Database } from '@/integrations/supabase/types';

type Project = Database['public']['Tables']['projects']['Row'];
type ProjectRow = Database['public']['Tables']['project_rows']['Row'];

interface ExportedProject {
  version: string;
  exportedAt: string;
  project: {
    name: string;
    hook_size: string;
    yarn_weight: string;
    details: string | null;
    is_favorite: boolean;
  };
  rows: Array<{
    type: string;
    position: number;
    instructions: string;
    counter: number;
    label: string | null;
    total_stitches: number;
  }>;
}

export const useProjectOperations = (user: any, fetchProjects: () => Promise<void>) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSaveProject = async (projectData: Omit<Project, 'id' | 'created_at' | 'updated_at' | 'user_id'>, editingProject?: Project | null) => {
    try {
      setLoading(true);
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

      await fetchProjects();
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

  const handleDeleteProject = async (id: string) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({
        title: "Project deleted",
        description: "Your project has been deleted successfully.",
      });
      await fetchProjects();
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

  const handleDuplicateProject = async (project: Project) => {
    try {
      setLoading(true);
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
      await fetchProjects();
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

  const handleToggleFavorite = async (id: string, isFavorite: boolean) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({ is_favorite: isFavorite })
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: isFavorite ? "Added to favorites" : "Removed from favorites",
        description: `Project has been ${isFavorite ? 'added to' : 'removed from'} your favorites.`,
      });
      
      await fetchProjects();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleExportProject = async (project: Project) => {
    try {
      setLoading(true);
      
      // Fetch all rows for the project
      const { data: rows, error: rowsError } = await supabase
        .from('project_rows')
        .select('type, position, instructions, counter, label, total_stitches')
        .eq('project_id', project.id)
        .order('position');

      if (rowsError) throw rowsError;

      // Create export data structure
      const exportData: ExportedProject = {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        project: {
          name: project.name,
          hook_size: project.hook_size,
          yarn_weight: project.yarn_weight,
          details: project.details,
          is_favorite: project.is_favorite,
        },
        rows: rows || [],
      };

      // Create and download file
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `${project.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.crochet`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Project exported",
        description: "Your project has been exported successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Export failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async (project: Project) => {
    try {
      setLoading(true);
      
      // Fetch all rows for the project
      const { data: rows, error: rowsError } = await supabase
        .from('project_rows')
        .select('type, position, instructions, counter, label, total_stitches')
        .eq('project_id', project.id)
        .order('position');

      if (rowsError) throw rowsError;

      // Create PDF
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 20;
      let yPosition = margin;

      // Header
      pdf.setFontSize(20);
      pdf.setFont(undefined, 'bold');
      pdf.text(project.name, margin, yPosition);
      yPosition += 15;

      // Project details
      pdf.setFontSize(12);
      pdf.setFont(undefined, 'normal');
      pdf.text(`Hook Size: ${project.hook_size}`, margin, yPosition);
      yPosition += 8;
      pdf.text(`Yarn Weight: ${project.yarn_weight}`, margin, yPosition);
      yPosition += 8;

      if (project.details) {
        const detailsLines = pdf.splitTextToSize(`Details: ${project.details}`, pageWidth - 2 * margin);
        pdf.text(detailsLines, margin, yPosition);
        yPosition += detailsLines.length * 6 + 5;
      }

      yPosition += 10;

      // Pattern rows
      pdf.setFontSize(14);
      pdf.setFont(undefined, 'bold');
      pdf.text('Pattern:', margin, yPosition);
      yPosition += 10;

      pdf.setFontSize(11);
      pdf.setFont(undefined, 'normal');

      let rowNumber = 1;
      rows?.forEach(row => {
        // Check if we need a new page
        if (yPosition > 270) {
          pdf.addPage();
          yPosition = margin;
        }

        let lineText = '';
        
        if (row.type === 'row') {
          lineText = `Row ${rowNumber}: ${row.instructions}`;
          if (row.counter > 1) {
            lineText += ` (repeat ${row.counter} times)`;
          }
          if (row.total_stitches > 0) {
            lineText += ` [${row.total_stitches} sts]`;
          }
          rowNumber++;
        } else if (row.type === 'note') {
          pdf.setFont(undefined, 'italic');
          lineText = `Note: ${row.instructions}`;
        } else if (row.type === 'divider') {
          pdf.setFont(undefined, 'bold');
          lineText = `--- ${row.instructions || 'Section Break'} ---`;
        }

        if (row.label) {
          lineText = `${row.label}: ${lineText}`;
        }

        const textLines = pdf.splitTextToSize(lineText, pageWidth - 2 * margin);
        pdf.text(textLines, margin, yPosition);
        yPosition += textLines.length * 6 + 3;
        
        // Reset font style
        pdf.setFont(undefined, 'normal');
      });

      // Footer
      yPosition += 20;
      if (yPosition > 270) {
        pdf.addPage();
        yPosition = margin;
      }
      
      pdf.setFontSize(8);
      pdf.setTextColor(128);
      pdf.text(`Exported on ${new Date().toLocaleDateString()}`, margin, yPosition);

      // Save PDF
      const filename = `${project.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_pattern.pdf`;
      pdf.save(filename);

      toast({
        title: "PDF exported",
        description: "Your pattern has been exported as PDF successfully.",
      });
    } catch (error: any) {
      toast({
        title: "PDF export failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImportProject = async (file: File) => {
    try {
      setLoading(true);
      
      // Read file content
      const fileContent = await file.text();
      let importData: ExportedProject;
      
      try {
        importData = JSON.parse(fileContent);
      } catch {
        throw new Error('Invalid file format. Please select a valid crochet project file.');
      }

      // Validate file structure
      if (!importData.version || !importData.project || !Array.isArray(importData.rows)) {
        throw new Error('Invalid project file structure.');
      }

      // Create new project with correct property structure
      const { data: newProject, error: projectError } = await supabase
        .from('projects')
        .insert({
          name: `${importData.project.name} (Imported)`,
          hook_size: importData.project.hook_size as Database['public']['Enums']['hook_size'],
          yarn_weight: importData.project.yarn_weight as Database['public']['Enums']['yarn_weight'],
          details: importData.project.details,
          user_id: user!.id,
          is_favorite: false, // Reset favorite status for imported projects
        })
        .select()
        .single();

      if (projectError) throw projectError;

      // Insert rows if they exist
      if (importData.rows && importData.rows.length > 0) {
        const rowsToInsert = importData.rows.map(row => ({
          project_id: newProject.id,
          type: row.type,
          position: row.position,
          instructions: row.instructions,
          counter: row.counter,
          label: row.label,
          total_stitches: row.total_stitches || 0,
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
        title: "Project imported",
        description: "Your project has been imported successfully.",
      });
      
      await fetchProjects();
    } catch (error: any) {
      toast({
        title: "Import failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    handleSaveProject,
    handleDeleteProject,
    handleDuplicateProject,
    handleToggleFavorite,
    handleExportProject,
    handleExportPDF,
    handleImportProject,
  };
};
