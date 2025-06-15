
import React, { useState, useRef } from "react";

interface CanvasItemProps {
  id: string;
  x: number;
  y: number;
  content: React.ReactNode;
  onMove: (id: string, x: number, y: number) => void;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

export const CanvasItem: React.FC<CanvasItemProps> = ({
  id, x, y, content, onMove, isSelected, onSelect
}) => {
  const [dragging, setDragging] = useState(false);
  const offset = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    setDragging(true);
    offset.current = { x: e.clientX - x, y: e.clientY - y };
    e.stopPropagation();
    onSelect(id);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!dragging) return;
    const newX = e.clientX - offset.current.x;
    const newY = e.clientY - offset.current.y;
    onMove(id, newX, newY);
  };

  const handleMouseUp = () => setDragging(false);

  React.useEffect(() => {
    if (dragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    } else {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  });

  return (
    <div
      className={`absolute select-none cursor-move ${isSelected ? "ring-2 ring-blue-400" : ""}`}
      style={{
        left: x,
        top: y,
        minWidth: 120,
        minHeight: 40,
        padding: 12,
        background: "#FFF",
        border: "1px solid #ddd",
        borderRadius: 6,
        zIndex: isSelected ? 2 : 1,
        userSelect: "none"
      }}
      onMouseDown={handleMouseDown}
      tabIndex={0}
    >
      {content}
    </div>
  );
};
