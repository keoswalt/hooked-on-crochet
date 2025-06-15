
import { useState } from "react";
import { CanvasElement } from "./canvasTypes";

export function useCanvasSelection() {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleSelect = (id: string, selectedTool: string) => {
    if (selectedTool === "move") setSelectedId(id);
  };

  const deselect = () => setSelectedId(null);

  return { selectedId, handleSelect, deselect };
}
