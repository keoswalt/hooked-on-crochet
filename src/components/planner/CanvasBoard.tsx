
import React, { useRef, useState } from "react";
import { CanvasItem } from "./CanvasItem";
import { v4 as uuidv4 } from "uuid";

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

  // Pan & zoom state
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  // For panning
  const [isPanning, setIsPanning] = useState(false);
  const panOrigin = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Add text element on drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    try {
      const dataRaw = e.dataTransfer.getData("application/json");
      if (!dataRaw) return;
      const data = JSON.parse(dataRaw);
      if (data.type !== "text") return;

      const boardRect = boardRef.current?.getBoundingClientRect();
      if (!boardRect) return;
      // Transform mouse point into canvas coordinates
      const mouseX = e.clientX - boardRect.left;
      const mouseY = e.clientY - boardRect.top;
      const x = (mouseX - pan.x) / zoom;
      const y = (mouseY - pan.y) / zoom;

      setItems((prev) => [
        ...prev,
        {
          id: uuidv4(),
          x,
          y,
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

  // panning handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only left button and background (not on any item)
    if (e.button !== 0) return;
    // Prevent panning if mousedown was on an element
    if ((e.target as Element) !== boardRef.current) return;
    setIsPanning(true);
    panOrigin.current = {
      x: e.clientX - pan.x,
      y: e.clientY - pan.y,
    };
  };

  React.useEffect(() => {
    if (!isPanning) return;

    const handleMove = (e: MouseEvent) => {
      setPan({
        x: e.clientX - panOrigin.current.x,
        y: e.clientY - panOrigin.current.y,
      });
    };

    const handleUp = () => setIsPanning(false);

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPanning]);

  // Zoom handler (scale around mouse if possible)
  const handleWheel = (e: React.WheelEvent) => {
    if (!(e.ctrlKey || e.metaKey)) return; // Only if Ctrl or Cmd pressed
    e.preventDefault();
    const boardRect = boardRef.current?.getBoundingClientRect();
    if (!boardRect) return;
    const mouseX = e.clientX - boardRect.left;
    const mouseY = e.clientY - boardRect.top;
    const prevZoom = zoom;
    let newZoom = zoom * (e.deltaY < 0 ? 1.08 : 0.92);
    newZoom = Math.max(0.2, Math.min(3, newZoom));
    // Adjust pan so the zoom centers around the mouse
    setPan(prev => ({
      x: mouseX - ((mouseX - prev.x) * (newZoom / prevZoom)),
      y: mouseY - ((mouseY - prev.y) * (newZoom / prevZoom)),
    }));
    setZoom(newZoom);
  };

  const handleMove = (id: string, x: number, y: number) => {
    setItems(items => items.map(item =>
      item.id === id ? { ...item, x, y } : item
    ));
  };

  const handleSelect = (id: string) => {
    setSelectedId(id);
  };

  // Background is tabIndex for accessibility and focus handlers
  return (
    <div
      ref={boardRef}
      className="relative w-full h-full bg-gray-50 overflow-hidden"
      style={{ minHeight: 400, touchAction: "none", cursor: isPanning ? "grabbing" : "default" }}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      tabIndex={0}
      onClick={() => setSelectedId(null)}
      onMouseDown={handleMouseDown}
      onWheel={handleWheel}
      aria-label="Canvas Board"
    >
      <div
        style={{
          transform: `translate(${pan.x}px,${pan.y}px) scale(${zoom})`,
          transformOrigin: "0 0",
          width: "100%",
          height: "100%",
          position: "absolute",
          left: 0,
          top: 0,
          pointerEvents: "none", // Only items should capture pointer events
        }}
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
            canvasPanZoom={{ pan, zoom }} // pass pan/zoom for correct drag move math
          />
        )}
      </div>
      {/* UI hint for pan/zoom */}
      <div className="absolute bottom-2 left-2 bg-white/80 rounded px-3 py-1 text-xs border select-none pointer-events-none z-10">
        Drag background to pan &nbsp; · &nbsp; Ctrl/Cmd+Scroll to zoom
      </div>
    </div>
  );
};
