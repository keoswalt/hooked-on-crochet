
export interface CanvasElement {
  id: string;
  x: number;
  y: number;
  type: string;
  content: string;
  isEditing?: boolean;
}

export type CanvasElements = CanvasElement[];

export interface CanvasBoardProps {
  selectedTool?: string;
}
