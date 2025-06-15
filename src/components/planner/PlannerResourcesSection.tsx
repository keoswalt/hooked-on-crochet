
import PlannerSection from "./PlannerSection";
import EmptyState from "@/components/ui/EmptyState";

const PlannerResourcesSection = () => (
  <PlannerSection
    title="Resources"
    buttonText="Add Resource"
    buttonDisabled
  >
    <EmptyState>
      Feature coming soon: add and view resources.
    </EmptyState>
  </PlannerSection>
);

export default PlannerResourcesSection;
