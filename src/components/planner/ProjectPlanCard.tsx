
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
    // Save the breadcrumb context
    if (currentPage) setPreviousPage(currentPage);
    navigate(`/planner/${planId}`);
  };

  return (
    <Card
      onClick={handleClick}
      tabIndex={0}
      className={cn(
        // Responsive: full width on mobile, narrow on desktop
        "cursor-pointer hover:shadow-md w-full max-w-none sm:max-w-xs transition-shadow",
        className
      )}
      aria-label={`View plan: ${planName}`}
    >
      <CardContent
        className={cn(
          // Responsive: stack column on mobile, row on desktop
          "flex flex-col sm:flex-row items-stretch sm:items-center p-3 gap-3"
        )}
      >
        <div
          className={cn(
            // Responsive: image full width, small on desktop
            "w-full aspect-square rounded bg-gray-100 overflow-hidden flex items-center justify-center sm:w-16 sm:h-16 sm:flex-shrink-0"
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
            <div className="text-xs text-gray-400 text-center w-full">No image</div>
          )}
        </div>
        <div className="flex-1 flex items-center min-w-0">
          <div
            className={cn(
              // Allow full wrapping on mobile, restrict lines on desktop only
              "text-sm text-left font-medium break-words",
              "sm:line-clamp-2"
            )}
          >
            {planName}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
