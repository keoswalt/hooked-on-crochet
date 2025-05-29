
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import type { Database } from '@/integrations/supabase/types';
import type { User } from '@supabase/supabase-js';

type Project = Database['public']['Tables']['projects']['Row'];

export const useProjectOperations = (user: User, refreshProjects: () => Promise<void>) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSaveProject = async (
    projectData: Omit<Project, 'id' | 'created_at' | 'updated_at' | 'user_id'>,
    editingProject?: Project | null
  ): Promise<Project | null> => {
    try {
      setLoading(true);
      
      if (editingProject) {
        // Update existing project
        const { data, error } = await supabase
          .from('projects')
          .update({
            ...projectData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingProject.id)
          .select()
          .single();

        if (error) throw error;

        toast({
          title: "Project updated",
          description: "Your project has been updated successfully.",
        });

        await refreshProjects();
        return data;
      } else {
        // Create new project
        const { data, error } = await supabase
          .from('projects')
          .insert({
            ...projectData,
            user_id: user.id,
          })
          .select()
          .single();

        if (error) throw error;

        toast({
          title: "Project created",
          description: "Your new project has been created successfully.",
        });

        await refreshProjects();
        return data;
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      setLoading(true);
      
      // Delete associated rows first
      await supabase
        .from('project_rows')
        .delete()
        .eq('project_id', projectId);

      // Delete the project
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (error) throw error;

      toast({
        title: "Project deleted",
        description: "The project has been deleted successfully.",
      });

      await refreshProjects();
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
      
      // Create duplicate project
      const { data: newProject, error: projectError } = await supabase
        .from('projects')
        .insert({
          name: `${project.name} (Copy)`,
          hook_size: project.hook_size,
          yarn_weight: project.yarn_weight,
          details: project.details,
          featured_image_url: project.featured_image_url,
          user_id: user.id,
          is_favorite: false,
          last_mode: project.last_mode,
        })
        .select()
        .single();

      if (projectError) throw projectError;

      // Get associated rows
      const { data: rows, error: rowsError } = await supabase
        .from('project_rows')
        .select('*')
        .eq('project_id', project.id)
        .order('position', { ascending: true });

      if (rowsError) throw rowsError;

      // Duplicate rows
      if (rows && rows.length > 0) {
        const duplicatedRows = rows.map(row => ({
          project_id: newProject.id,
          type: row.type,
          instructions: row.instructions,
          label: row.label,
          counter: row.counter,
          total_stitches: row.total_stitches,
          make_mode_counter: row.make_mode_counter,
          make_mode_status: row.make_mode_status,
          image_url: row.image_url,
          is_locked: row.is_locked,
          position: row.position,
        }));

        const { error: insertError } = await supabase
          .from('project_rows')
          .insert(duplicatedRows);

        if (insertError) throw insertError;
      }

      toast({
        title: "Project duplicated",
        description: "The project has been duplicated successfully.",
      });

      await refreshProjects();
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

  const handleToggleFavorite = async (project: Project) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({ is_favorite: !project.is_favorite })
        .eq('id', project.id);

      if (error) throw error;

      await refreshProjects();
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
      // Get project rows
      const { data: rows, error } = await supabase
        .from('project_rows')
        .select('*')
        .eq('project_id', project.id)
        .order('position', { ascending: true });

      if (error) throw error;

      // Convert images to base64 for inclusion in the export
      const convertImageToBase64 = async (imageUrl: string): Promise<string | null> => {
        try {
          const response = await fetch(imageUrl);
          const blob = await response.blob();
          return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = () => resolve(null);
            reader.readAsDataURL(blob);
          });
        } catch (error) {
          console.error('Error converting image to base64:', error);
          return null;
        }
      };

      // Process featured image
      let featuredImageBase64 = null;
      if (project.featured_image_url) {
        featuredImageBase64 = await convertImageToBase64(project.featured_image_url);
      }

      // Process row images
      const processedRows = await Promise.all(
        (rows || []).map(async (row) => {
          let imageBase64 = null;
          if (row.image_url) {
            imageBase64 = await convertImageToBase64(row.image_url);
          }
          return {
            ...row,
            image_base64: imageBase64,
          };
        })
      );

      const exportData = {
        project: {
          name: project.name,
          hook_size: project.hook_size,
          yarn_weight: project.yarn_weight,
          details: project.details,
          featured_image_base64: featuredImageBase64,
        },
        rows: processedRows,
        exportedAt: new Date().toISOString(),
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json',
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${project.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.crochet`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Project exported",
        description: "Your project has been exported successfully with all images included.",
      });
    } catch (error: any) {
      toast({
        title: "Export failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleExportPDF = async (project: Project) => {
    try {
      // Get project rows
      const { data: rows, error } = await supabase
        .from('project_rows')
        .select('*')
        .eq('project_id', project.id)
        .order('position', { ascending: true });

      if (error) throw error;

      const pdf = new jsPDF();
      let yPosition = 20;

      // Helper function to add image to PDF
      const addImageToPDF = async (imageUrl: string, maxWidth = 170, maxHeight = 100) => {
        try {
          const response = await fetch(imageUrl);
          const blob = await response.blob();
          const reader = new FileReader();
          
          return new Promise<{ width: number; height: number }>((resolve) => {
            reader.onload = function(event) {
              const img = new Image();
              img.onload = function() {
                // Calculate aspect ratio and fit within max dimensions
                const aspectRatio = img.width / img.height;
                let width = maxWidth;
                let height = maxWidth / aspectRatio;
                
                if (height > maxHeight) {
                  height = maxHeight;
                  width = maxHeight * aspectRatio;
                }
                
                pdf.addImage(event.target?.result as string, 'JPEG', 20, yPosition, width, height);
                resolve({ width, height });
              };
              img.src = event.target?.result as string;
            };
            reader.readAsDataURL(blob);
          });
        } catch (error) {
          console.error('Error adding image to PDF:', error);
          return { width: 0, height: 0 };
        }
      };

      // Add title
      pdf.setFontSize(20);
      pdf.text(project.name, 20, yPosition);
      yPosition += 20;

      // Add featured image if exists
      if (project.featured_image_url) {
        const { height } = await addImageToPDF(project.featured_image_url);
        yPosition += height + 15;
        
        if (yPosition > 270) {
          pdf.addPage();
          yPosition = 20;
        }
      }

      // Add project details
      pdf.setFontSize(12);
      pdf.text(`Hook Size: ${project.hook_size}`, 20, yPosition);
      yPosition += 10;
      pdf.text(`Yarn Weight: ${project.yarn_weight}`, 20, yPosition);
      yPosition += 15;

      if (project.details) {
        pdf.text('Details:', 20, yPosition);
        yPosition += 10;
        const splitDetails = pdf.splitTextToSize(project.details, 170);
        pdf.text(splitDetails, 20, yPosition);
        yPosition += splitDetails.length * 5 + 10;
      }

      // Add rows
      if (rows && rows.length > 0) {
        pdf.text('Pattern:', 20, yPosition);
        yPosition += 15;

        for (const row of rows) {
          if (yPosition > 270) {
            pdf.addPage();
            yPosition = 20;
          }

          if (row.type === 'divider') {
            pdf.text('--- Divider ---', 20, yPosition);
            yPosition += 10;
          } else if (row.type === 'note') {
            pdf.text(`Note: ${row.instructions}`, 20, yPosition);
            yPosition += 10;
          } else {
            const rowText = `Row ${row.counter}: ${row.instructions}`;
            const splitText = pdf.splitTextToSize(rowText, 170);
            pdf.text(splitText, 20, yPosition);
            yPosition += splitText.length * 5 + 5;
          }

          // Add row image if exists
          if (row.image_url) {
            if (yPosition > 200) {
              pdf.addPage();
              yPosition = 20;
            }
            
            const { height } = await addImageToPDF(row.image_url, 120, 80);
            yPosition += height + 10;
          }
        }
      }

      pdf.save(`${project.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`);

      toast({
        title: "PDF exported",
        description: "Your project has been exported as PDF successfully.",
      });
    } catch (error: any) {
      toast({
        title: "PDF export failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleImportProject = async (file: File) => {
    try {
      setLoading(true);
      
      const text = await file.text();
      const importData = JSON.parse(text);

      // Create the project
      const { data: newProject, error: projectError } = await supabase
        .from('projects')
        .insert({
          name: importData.project.name,
          hook_size: importData.project.hook_size,
          yarn_weight: importData.project.yarn_weight,
          details: importData.project.details,
          user_id: user.id,
        })
        .select()
        .single();

      if (projectError) throw projectError;

      // Import rows if they exist
      if (importData.rows && importData.rows.length > 0) {
        const rowsToInsert = importData.rows.map((row: any, index: number) => ({
          project_id: newProject.id,
          type: row.type || 'row',
          instructions: row.instructions || '',
          label: row.label || '',
          counter: row.counter || 1,
          total_stitches: row.total_stitches || 0,
          make_mode_counter: 0,
          make_mode_status: 'not_started',
          position: index,
        }));

        const { error: rowsError } = await supabase
          .from('project_rows')
          .insert(rowsToInsert);

        if (rowsError) throw rowsError;
      }

      toast({
        title: "Project imported",
        description: "Your project has been imported successfully.",
      });

      await refreshProjects();
    } catch (error: any) {
      toast({
        title: "Import failed",
        description: "Failed to import project. Please check the file format.",
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
