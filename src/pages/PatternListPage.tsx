
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PatternListView } from '@/components/patterns/PatternListView';
import { PatternForm } from '@/components/patterns/PatternForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { usePatternState } from '@/hooks/usePatternState';
import { usePatternOperations } from '@/hooks/usePatternOperations';
import type { Database } from '@/integrations/supabase/types';
import type { User } from '@supabase/supabase-js';

type Pattern = Database['public']['Tables']['patterns']['Row'];
type HookSize = Database['public']['Enums']['hook_size'];
type YarnWeight = Database['public']['Enums']['yarn_weight'];

interface PatternListPageProps {
  user: User;
}

export const PatternListPage = ({ user }: PatternListPageProps) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingPattern, setEditingPattern] = useState<Pattern | null>(null);
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

  const { patterns, loading, fetchPatterns } = usePatternState(user);
  const {
    loading: operationsLoading,
    handleSavePattern,
    handleDeletePattern,
    handleDuplicatePattern,
    handleToggleFavorite,
    handleImportPattern,
  } = usePatternOperations(user, fetchPatterns);

  // Reset form data when editing pattern changes
  useEffect(() => {
    if (editingPattern) {
      setFormData({
        name: editingPattern.name,
        hook_size: editingPattern.hook_size,
        yarn_weight: editingPattern.yarn_weight,
        details: editingPattern.details || '',
        featured_image_url: editingPattern.featured_image_url || null,
      });
    } else {
      setFormData({
        name: '',
        hook_size: '',
        yarn_weight: '',
        details: '',
        featured_image_url: null,
      });
    }
  }, [editingPattern]);

  const handleToggleFavoriteWrapper = async (id: string, isFavorite: boolean) => {
    const pattern = patterns.find(p => p.id === id);
    if (pattern) {
      await handleToggleFavorite(pattern);
    }
  };

  const handleDuplicateWrapper = async (pattern: Pattern) => {
    await handleDuplicatePattern(pattern);
  };

  const handleFormSubmit = async () => {
    if (formData.hook_size && formData.yarn_weight) {
      const patternData = {
        name: formData.name,
        hook_size: formData.hook_size,
        yarn_weight: formData.yarn_weight,
        details: formData.details || null,
        featured_image_url: formData.featured_image_url,
        is_favorite: editingPattern?.is_favorite || false,
        last_mode: editingPattern?.last_mode || 'edit',
        status: editingPattern?.status || null,
      };

      const savedPattern = await handleSavePattern(patternData, editingPattern);
      if (savedPattern) {
        setShowForm(false);
        setEditingPattern(null);
      }
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingPattern(null);
  };

  const handleCardClick = (pattern: Pattern) => {
    navigate(`/patterns/${pattern.id}`);
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-8 text-center">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <PatternListView
        patterns={patterns}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onEditPattern={(pattern) => {
          setEditingPattern(pattern);
          setShowForm(true);
        }}
        onDeletePattern={handleDeletePattern}
        onDuplicatePattern={handleDuplicateWrapper}
        onToggleFavorite={handleToggleFavoriteWrapper}
        onCardClick={handleCardClick}
        onCreatePattern={() => setShowForm(true)}
        onImportPattern={handleImportPattern}
        operationsLoading={operationsLoading}
        userId={user.id}
      />

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0">
          <DialogHeader className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <DialogTitle>{editingPattern ? 'Edit Pattern' : 'New Pattern'}</DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <PatternForm
              pattern={editingPattern}
              formData={formData}
              onFormDataChange={setFormData}
              userId={user.id}
              showButtons={false}
              onRefreshPatterns={fetchPatterns}
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
                {editingPattern ? 'Update Pattern' : 'Create Pattern'}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
