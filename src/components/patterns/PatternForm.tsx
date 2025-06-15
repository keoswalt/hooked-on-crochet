
import { PatternBasicFields } from './PatternBasicFields';
import { PatternImageSection } from './PatternImageSection';
import { PatternDetailsField } from './PatternDetailsField';
import { PatternTagsSection } from './PatternTagsSection';
import { Button } from '@/components/ui/button';
import type { Database } from '@/integrations/supabase/types';

type Pattern = Database['public']['Tables']['patterns']['Row'];
type HookSize = Database['public']['Enums']['hook_size'];
type YarnWeight = Database['public']['Enums']['yarn_weight'];

interface FormData {
  name: string;
  hook_size: HookSize | '';
  yarn_weight: YarnWeight | '';
  details: string;
  featured_image_url: string | null;
}

interface PatternFormProps {
  pattern?: Pattern | null;
  formData: FormData;
  onFormDataChange: (data: FormData) => void;
  userId: string;
  showButtons?: boolean;
  onRefreshPatterns?: () => Promise<void>;
}

export const PatternForm = ({
  pattern,
  formData,
  onFormDataChange,
  userId,
  showButtons = true,
  onRefreshPatterns,
}: PatternFormProps) => {
  return (
    <div className="space-y-6">
      <PatternBasicFields 
        formData={formData}
        onFormDataChange={onFormDataChange}
      />

      <PatternImageSection
        imageUrl={formData.featured_image_url}
        onImageChange={(url) => onFormDataChange({ ...formData, featured_image_url: url })}
        userId={userId}
      />

      <PatternDetailsField
        details={formData.details}
        onDetailsChange={(details) => onFormDataChange({ ...formData, details })}
      />

      {pattern && (
        <PatternTagsSection
          patternId={pattern.id}
          userId={userId}
          onTagsUpdate={onRefreshPatterns}
        />
      )}
    </div>
  );
};
