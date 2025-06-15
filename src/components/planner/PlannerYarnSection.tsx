
import PlannerSection from "./PlannerSection";
import EmptyState from "@/components/ui/EmptyState";

const PlannerYarnSection = () => (
  <PlannerSection
    title="Yarn"
    buttonText="Add Yarn"
    buttonDisabled
  >
    <EmptyState>
      Feature coming soon: attach yarn from your stash.
    </EmptyState>
  </PlannerSection>
);

export default PlannerYarnSection;
