
import { Badge } from '@/components/ui/badge';
import type { Database } from '@/integrations/supabase/types';

type PatternStatus = Database['public']['Tables']['patterns']['Row']['status'];

interface PatternStatusChipProps {
  status: PatternStatus;
}

export const PatternStatusChip = ({ status }: PatternStatusChipProps) => {
  if (!status) {
    return null;
  }

  const getStatusConfig = (status: PatternStatus) => {
    switch (status) {
      case 'Writing':
        return { label: 'Writing', className: 'bg-blue-100 text-blue-800' };
      case 'Ready':
        return { label: 'Ready', className: 'bg-green-100 text-green-800' };
      case 'Making':
        return { label: 'Making', className: 'bg-yellow-100 text-yellow-800' };
      case 'Made':
        return { label: 'Made', className: 'bg-purple-100 text-purple-800' };
      default:
        return { label: status, className: 'bg-gray-100 text-gray-800' };
    }
  };

  const getStatusIcon = (status: PatternStatus) => {
    switch (status) {
      case 'Writing':
        return '✏️';
      case 'Ready':
        return '✅';
      case 'Making':
        return '🧶';
      case 'Made':
        return '🎉';
      default:
        return '';
    }
  };

  const config = getStatusConfig(status);
  const icon = getStatusIcon(status);

  return (
    <Badge variant="outline" className={config.className}>
      {icon && <span className="mr-1">{icon}</span>}
      {config.label}
    </Badge>
  );
};
