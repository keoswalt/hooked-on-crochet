
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { PatternDetail } from '@/components/patterns/PatternDetail';
import { PatternForm } from '@/components/patterns/PatternForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { usePatternOperations } from '@/hooks/usePatternOperations';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';
import type { User } from '@supabase/supabase-js';

type Pattern = Database['public']['Tables']['patterns']['Row'];
type HookSize = Database['public']['Enums']['hook_size'];
type YarnWeight = Database['public']['Enums']['yarn_weight'];

interface PatternDetailPageProps {
  user: User;
}

export const PatternDetailPage = ({ user }: PatternDetailPageProps) => {
  const { patternId } = useParams<{ patternId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [pattern, setPattern] = useState<Pattern | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<{
    name: string;
    hook_size: HookSize | '';
    yarn_weight: YarnWeight | '';
    details: string;
    featured_image_url: string | null;
  }>({
    name: '',
    hook_size: '',
    yarn_weight: '',
    details: '',
    featured_image_url: null,
  });

  const {
    loading: operationsLoading,
    handleSavePattern,
    handleDeletePattern,
    handleDuplicatePattern,
    handleExportPattern,
    handleExportPDF,
  } = usePatternOperations(user, fetchPattern);

  async function fetchPattern() {
    if (!patternId) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('patterns')
        .select('*')
        .eq('id', patternId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      
      if (!data) {
        setNotFound(true);
      } else {
        setPattern(data);
        setNotFound(false);
      }
    } catch (error: any) {
      console.error('Error fetching pattern:', error);
      toast({
        title: "Error",
        description: "Failed to load pattern",
        variant: "destructive",
      });
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPattern();
  }, [patternId, user.id]);

  // Reset form data when pattern changes
  useEffect(() => {
    if (pattern) {
      setFormData({
        name: pattern.name,
        hook_size: pattern.hook_size,
        yarn_weight: pattern.yarn_weight,
        details: pattern.details || '',
        featured_image_url: pattern.featured_image_url || null,
      });
    }
  }, [pattern]);

  const handleBack = () => {
    navigate('/patterns');
  };

  const handlePatternDelete = async () => {
    if (pattern) {
      await handleDeletePattern(pattern.id);
      navigate('/patterns');
    }
  };

  const handleEditPattern = (patternToEdit: Pattern) => {
    setPattern(patternToEdit);
    setShowForm(true);
  };

  const handlePatternUpdate = (updatedPattern: Pattern) => {
    setPattern(updatedPattern);
  };

  const handleDuplicate = async () => {
    if (pattern) {
      await handleDuplicatePattern(pattern);
    }
  };

  const handleFormSubmit = async () => {
    if (formData.hook_size && formData.yarn_weight && pattern) {
      const patternData = {
        name: formData.name,
        hook_size: formData.hook_size,
        yarn_weight: formData.yarn_weight,
        details: formData.details || null,
        featured_image_url: formData.featured_image_url,
        is_favorite: pattern.is_favorite,
        last_mode: pattern.last_mode,
        status: pattern.status,
      };

      const savedPattern = await handleSavePattern(patternData, pattern);
      if (savedPattern) {
        setPattern(savedPattern);
        setShowForm(false);
      }
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-8 text-center">Loading...</div>;
  }

  if (notFound) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Pattern Not Found</h1>
        <p className="text-gray-600 mb-6">The pattern you're looking for doesn't exist or you don't have access to it.</p>
        <Button onClick={handleBack}>Back to Patterns</Button>
      </div>
    );
  }

  if (!pattern) {
    return <div className="container mx-auto px-4 py-8 text-center">Pattern not found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <PatternDetail
        pattern={pattern}
        onBack={handleBack}
        onPatternDelete={handlePatternDelete}
        onPatternExport={() => handleExportPattern(pattern)}
        onPatternExportPDF={() => handleExportPDF(pattern)}
        onEditPattern={handleEditPattern}
        onPatternUpdate={handlePatternUpdate}
        onDuplicate={handleDuplicate}
        userId={user.id}
      />

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0">
          <DialogHeader className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <DialogTitle>Edit Pattern</DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <PatternForm
              pattern={pattern}
              formData={formData}
              onFormDataChange={setFormData}
              userId={user.id}
              showButtons={false}
              onRefreshPatterns={fetchPattern}
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
                Update Pattern
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
