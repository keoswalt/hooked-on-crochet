
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";

interface CanvasZoomPanelProps {
  zoom: number;
  onReset: () => void;
}
export function CanvasZoomPanel({ zoom, onReset }: CanvasZoomPanelProps) {
  return (
    <div className="absolute top-2 right-2 z-20 flex items-center gap-2 shadow-sm bg-white/90 rounded px-3 py-1 border">
      <span className="text-sm font-medium">
        Zoom: {(zoom * 100).toFixed(0)}%
      </span>
      <Button
        size="icon"
        variant="ghost"
        className="ml-1"
        title="Reset Zoom & Center"
        onClick={onReset}
        type="button"
      >
        <RotateCcw className="w-4 h-4" />
      </Button>
    </div>
  );
}
