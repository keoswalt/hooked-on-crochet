
import { Badge } from '@/components/ui/badge';
import { BadgeInfo, BadgeCheck, BadgeAlert, CircleCheck } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type ProjectStatus = Database['public']['Enums']['project_status'];

interface ProjectStatusChipProps {
  status: ProjectStatus | null;
  size?: 'sm' | 'default';
}

const statusConfig = {
  Writing: {
    icon: BadgeInfo,
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-800',
    borderColor: 'border-amber-200'
  },
  Ready: {
    icon: BadgeCheck,
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-800',
    borderColor: 'border-blue-200'
  },
  Making: {
    icon: BadgeAlert,
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-800',
    borderColor: 'border-yellow-200'
  },
  Made: {
    icon: CircleCheck,
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    borderColor: 'border-green-200'
  }
};

export const ProjectStatusChip = ({ status, size = 'default' }: ProjectStatusChipProps) => {
  if (!status) {
    return null;
  }

  const config = statusConfig[status];
  const Icon = config.icon;
  const iconSize = size === 'sm' ? 'h-3 w-3' : 'h-4 w-4';
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm';

  return (
    <Badge 
      variant="outline" 
      className={`
        ${config.bgColor} 
        ${config.textColor} 
        ${config.borderColor} 
        ${textSize}
        flex items-center gap-1 
        hover:shadow-sm 
        transition-shadow
      `}
    >
      <Icon className={iconSize} />
      {status}
    </Badge>
  );
};
