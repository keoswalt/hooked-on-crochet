import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash } from 'lucide-react';
import { AspectRatio } from '@/components/ui/aspect-ratio';

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
      {/* Image Section with Square Aspect Ratio */}
      <div className="w-full shrink-0 relative">
        <AspectRatio ratio={1 / 1} className="w-full">
          <div className="w-full h-full rounded-lg overflow-hidden bg-gray-100 p-2 flex items-center justify-center">
            {plan.featured_image_url ? (
              <img
                src={plan.featured_image_url}
                alt={plan.name || 'Plan image'}
                className="w-full h-full object-cover object-center rounded"
                draggable={false}
              />
            ) : (
              <div className="text-gray-300 text-xs text-center w-full">No image</div>
            )}
          </div>
        </AspectRatio>
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
