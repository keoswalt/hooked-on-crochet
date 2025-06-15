
import React, { useRef, useState } from "react";
import { CanvasItem } from "./CanvasItem";
import { v4 as uuidv4 } from "uuid";

/**
 * For the first version, only support dragging "text" drops with a content property.
 */

interface CanvasElement {
  id: string;
  x: number;
  y: number;
  type: string;
  content: string;
}

export const CanvasBoard: React.FC = () => {
  const boardRef = useRef<HTMLDivElement>(null);
  const [items, setItems] = useState<CanvasElement[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Support drag from external source (Drawer, etc)
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    // Only accept type "text" for the minimum working version
    try {
      const dataRaw = e.dataTransfer.getData("application/json");
      if (!dataRaw) return;
      const data = JSON.parse(dataRaw);
      if (data.type !== "text") return;

      const boardRect = boardRef.current?.getBoundingClientRect();
      if (!boardRect) return;
      const x = e.clientX - boardRect.left;
      const y = e.clientY - boardRect.top;

      setItems((prev) => [
        ...prev,
        {
          id: uuidv4(),
          x, y,
          type: "text",
          content: data.data.content || "Text"
        }
      ]);
    } catch (err) {
      // Ignore
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  };

  const handleMove = (id: string, x: number, y: number) => {
    setItems(items => items.map(item =>
      item.id === id ? { ...item, x, y } : item
    ));
  };

  const handleSelect = (id: string) => {
    setSelectedId(id);
  };

  return (
    <div
      ref={boardRef}
      className="relative w-full h-full bg-gray-50 overflow-hidden"
      style={{ minHeight: 400 }}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      tabIndex={0}
      onClick={() => setSelectedId(null)}
      aria-label="Canvas Board"
    >
      {items.map((item) =>
        <CanvasItem
          key={item.id}
          id={item.id}
          x={item.x}
          y={item.y}
          content={<span className="text-base">{item.content}</span>}
          onMove={handleMove}
          isSelected={selectedId === item.id}
          onSelect={handleSelect}
        />
      )}
    </div>
  );
};
