
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useNavigationContext } from "@/context/NavigationContext";
import { cn } from "@/lib/utils";

interface ProjectPlanCardProps {
  planId: string;
  planName: string;
  imageUrl?: string | null;
  className?: string;
  currentPage?: { label: string; path: string };
}

export function ProjectPlanCard({
  planId,
  planName,
  imageUrl,
  className,
  currentPage,
}: ProjectPlanCardProps) {
  const navigate = useNavigate();
  const { setPreviousPage } = useNavigationContext();

  const handleClick = () => {
    if (currentPage) setPreviousPage(currentPage);
    navigate(`/planner/${planId}`);
  };

  return (
    <Card
      onClick={handleClick}
      tabIndex={0}
      className={cn(
        "cursor-pointer hover:shadow-md w-full max-w-xs transition-shadow",
        className
      )}
      aria-label={`View plan: ${planName}`}
    >
      <CardContent
        className={cn(
          // flex-col on mobile for vertical stacking, flex-row on sm+ for side by side
          "flex flex-col sm:flex-row items-center sm:items-center p-3 gap-3 w-full"
        )}
      >
        <div
          // Small square image: 20% of previous size on desktop (w-16), slightly larger (w-20) on mobile
          className={cn(
            "rounded bg-gray-100 overflow-hidden flex items-center justify-center flex-shrink-0",
            "w-20 h-20 sm:w-16 sm:h-16 mb-2 sm:mb-0"
          )}
        >
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={`${planName} featured`}
              className="w-full h-full object-cover object-top"
              draggable={false}
            />
          ) : (
            <div className="text-xs text-gray-400 text-center">No image</div>
          )}
        </div>
        <div className="flex-1 flex items-center min-w-0 w-full">
          <div className="text-sm text-left font-medium line-clamp-2 w-full">{planName}</div>
        </div>
      </CardContent>
    </Card>
  );
}
