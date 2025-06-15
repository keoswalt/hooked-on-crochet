
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
        "cursor-pointer hover:shadow-md w-full max-w-xs transition-shadow",
        className
      )}
      aria-label={`View plan: ${planName}`}
    >
      <CardContent className="flex flex-col items-center p-3">
        <div className="w-full aspect-square rounded bg-gray-100 mb-2 overflow-hidden flex items-center justify-center">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={`${planName} featured`}
              className="w-full h-full object-cover object-top"
              draggable={false}
            />
          ) : (
            <div className="text-xs text-gray-400">No image</div>
          )}
        </div>
        <div className="text-sm text-center font-medium line-clamp-2">{planName}</div>
      </CardContent>
    </Card>
  );
}
