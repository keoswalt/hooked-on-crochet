
import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface PlannerSectionProps {
  title: string;
  children?: ReactNode;
  buttonText?: string;
  onAdd?: () => void;
  buttonDisabled?: boolean;
}

export const PlannerSection = ({
  title,
  children,
  buttonText,
  onAdd,
  buttonDisabled,
}: PlannerSectionProps) => (
  <section className="mb-8">
    <div className="flex justify-between items-center mb-2">
      <h2 className="font-semibold text-lg">{title}</h2>
      {buttonText && (
        <Button
          size="sm"
          variant="outline"
          onClick={onAdd}
          disabled={buttonDisabled}
        >
          <Plus className="w-4 h-4 mr-1" />
          {buttonText}
        </Button>
      )}
    </div>
    {children}
  </section>
);

export default PlannerSection;
