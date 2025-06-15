
import PlannerSection from "./PlannerSection";
import EmptyState from "@/components/ui/EmptyState";

const PlannerNotesSection = () => (
  <PlannerSection
    title="Notes"
    buttonText="Add Note"
    buttonDisabled
  >
    <EmptyState>
      Jot down notes about your plan here.
    </EmptyState>
  </PlannerSection>
);

export default PlannerNotesSection;
