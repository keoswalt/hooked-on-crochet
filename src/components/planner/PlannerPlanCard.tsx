
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash } from 'lucide-react';

interface PlannerPlanCardProps {
  plan: {
    id: string;
    name: string | null;
    description?: string | null;
    featured_image_url?: string | null;
  };
  onClick: () => void;
  onDelete: () => void;
}

export function PlannerPlanCard({ plan, onClick, onDelete }: PlannerPlanCardProps) {
  return (
    <Card
      key={plan.id}
      className="hover:shadow-lg transition-shadow relative group flex flex-col items-stretch h-full"
    >
      {/* Image Section */}
      <div className="w-full h-48 flex items-center justify-center p-4 shrink-0 relative">
        <div className="w-full h-40 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
          {plan.featured_image_url ? (
            <img
              src={plan.featured_image_url}
              alt={plan.name || 'Plan image'}
              className="w-full h-full object-cover object-center"
              draggable={false}
            />
          ) : (
            <div className="text-gray-300 text-xs text-center w-full">No image</div>
          )}
        </div>
      </div>
      {/* Card Content */}
      <div
        className="w-full flex-1 flex flex-col justify-center px-4 py-4 cursor-pointer"
        onClick={onClick}
      >
        {/* Title + delete row */}
        <div className="flex items-start justify-between gap-x-2">
          <CardHeader className="p-0 mb-2 flex-1 min-w-0">
            <CardTitle className="truncate text-lg">{plan.name}</CardTitle>
            {plan.description && (
              <CardDescription className="truncate">{plan.description}</CardDescription>
            )}
          </CardHeader>
          <Button
            variant="ghost"
            size="sm"
            onClick={e => {
              e.stopPropagation();
              onDelete();
            }}
            className="h-8 w-8 p-0 shrink-0 ml-2"
            tabIndex={0}
            aria-label="Delete plan"
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
