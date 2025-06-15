import React, { useState, useRef } from "react";

interface CanvasItemProps {
  id: string;
  x: number;
  y: number;
  content: React.ReactNode;
  onMove: (id: string, x: number, y: number) => void;
  isSelected: boolean;
  onSelect: (id: string) => void;
  canvasPanZoom?: { pan: { x: number; y: number }; zoom: number };
  onDoubleClick?: () => void;
}

export const CanvasItem: React.FC<CanvasItemProps> = ({
  id, x, y, content, onMove, isSelected, onSelect, canvasPanZoom, onDoubleClick
}) => {
  const [dragging, setDragging] = useState(false);
  const pointerOffset = useRef({ x: 0, y: 0 });

  // Helper: get screen coordinates from canvas coords considering pan/zoom
  function canvasToScreen(cx: number, cy: number) {
    if (!canvasPanZoom) return { sx: cx, sy: cy };
    const { pan, zoom } = canvasPanZoom;
    return {
      sx: cx * zoom + pan.x,
      sy: cy * zoom + pan.y
    };
  }
  // Helper: get canvas coords from screen
  function screenToCanvas(sx: number, sy: number) {
    if (!canvasPanZoom) return { cx: sx, cy: sy };
    const { pan, zoom } = canvasPanZoom;
    return {
      cx: (sx - pan.x) / zoom,
      cy: (sy - pan.y) / zoom,
    };
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    setDragging(true);
    // Calculate pointer offset relative to element origin in canvas coords
    const { cx, cy } = screenToCanvas(e.clientX, e.clientY);
    pointerOffset.current = { x: cx - x, y: cy - y };
    e.stopPropagation();
    onSelect(id);
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    if (onDoubleClick) {
      e.stopPropagation();
      onDoubleClick();
    }
  };

  React.useEffect(() => {
    if (!dragging) return;

    const handleMove = (e: MouseEvent) => {
      const { cx, cy } = screenToCanvas(e.clientX, e.clientY);
      const newX = cx - pointerOffset.current.x;
      const newY = cy - pointerOffset.current.y;
      onMove(id, newX, newY);
    };

    const handleUp = () => setDragging(false);

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dragging]);

  // Compute absolute position for CSS
  const { sx, sy } = canvasToScreen(x, y);

  return (
    <div
      className={`absolute select-none cursor-move ${isSelected ? "ring-2 ring-blue-400" : ""}`}
      style={{
        left: sx,
        top: sy,
        minWidth: 120,
        minHeight: 40,
        padding: 12,
        background: "#FFF",
        border: "1px solid #ddd",
        borderRadius: 6,
        zIndex: isSelected ? 2 : 1,
        userSelect: "none",
        transform: "translate(0, 0)",
        pointerEvents: "auto",
      }}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
      tabIndex={0}
    >
      {content}
    </div>
  );
};
