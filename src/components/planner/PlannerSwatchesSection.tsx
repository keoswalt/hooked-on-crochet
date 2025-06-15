
import PlannerSection from "./PlannerSection";
import EmptyState from "@/components/ui/EmptyState";

const PlannerSwatchesSection = () => (
  <PlannerSection
    title="Swatches"
    buttonText="Add Swatch"
    buttonDisabled
  >
    <EmptyState>
      Feature coming soon: attach swatches.
    </EmptyState>
  </PlannerSection>
);

export default PlannerSwatchesSection;
