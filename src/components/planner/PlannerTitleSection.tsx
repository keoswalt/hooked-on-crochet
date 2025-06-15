
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

interface PlannerTitleSectionProps {
  editableName: string;
  setEditableName: (n: string) => void;
  editableDesc: string;
  setEditableDesc: (d: string) => void;
  loading: boolean;
  handleFieldBlur: () => void;
  saving: boolean;
  saveSuccess: boolean;
  saveError: string | null;
}

export const PlannerTitleSection = ({
  editableName,
  setEditableName,
  editableDesc,
  setEditableDesc,
  loading,
  handleFieldBlur,
  saving,
  saveSuccess,
  saveError,
}: PlannerTitleSectionProps) => (
  <div className="flex-1 max-w-2xl">
    <div className="relative">
      <Input
        value={editableName}
        onChange={e => setEditableName(e.target.value)}
        onBlur={handleFieldBlur}
        disabled={loading}
        maxLength={100}
        placeholder="Plan Name"
        className="text-4xl lg:text-5xl font-extrabold leading-tight tracking-tight px-0 border-none shadow-none bg-transparent focus:ring-0 focus:outline-none mb-6"
      />
      {/* Show auto-save status */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-1">
        {saving && <Loader2 className="animate-spin h-5 w-5 text-gray-300" />}
        {saveSuccess && !saving && <CheckCircle2 className="h-5 w-5 text-green-500" />}
        {saveError && !saving && <XCircle className="h-5 w-5 text-red-500" />}
      </div>
    </div>
    <Textarea
      value={editableDesc}
      onChange={e => setEditableDesc(e.target.value)}
      onBlur={handleFieldBlur}
      placeholder="Description"
      rows={2}
      disabled={loading}
      maxLength={400}
      className="mt-4 resize-none p-3 border border-muted focus:border-ring focus:outline-none bg-transparent shadow-none text-base transition-colors"
    />
  </div>
);

export default PlannerTitleSection;
