
import { Badge } from '@/components/ui/badge';
import type { Database } from '@/integrations/supabase/types';

type PatternStatus = Database['public']['Tables']['patterns']['Row']['status'];

interface PatternStatusChipProps {
  status: PatternStatus;
}

export const PatternStatusChip = ({ status }: PatternStatusChipProps) => {
  if (!status) return null;

  const getStatusColor = (status: PatternStatus) => {
    switch (status) {
      case 'not_started':
        return 'bg-gray-100 text-gray-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'on_hold':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: PatternStatus) => {
    switch (status) {
      case 'not_started':
        return 'Not Started';
      case 'in_progress':
        return 'In Progress';
      case 'completed':
        return 'Completed';
      case 'on_hold':
        return 'On Hold';
      default:
        return status;
    }
  };

  return (
    <Badge variant="secondary" className={`text-xs ${getStatusColor(status)}`}>
      {getStatusLabel(status)}
    </Badge>
  );
};
