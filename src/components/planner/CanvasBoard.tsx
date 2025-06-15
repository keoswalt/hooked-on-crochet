import React, { useRef, useState } from "react";
import { CanvasItem } from "./CanvasItem";
import { v4 as uuidv4 } from "uuid";
import { RotateCcw } from "lucide-react"; // use for reset icon
import { Button } from "@/components/ui/button";
import type { ToolType } from "./ToolsToolbar";
import { EditableTextItem } from "./EditableTextItem";

interface CanvasElement {
  id: string;
  x: number;
  y: number;
  type: string;
  content: string;
  // Added for text edit state
  isEditing?: boolean;
}

interface CanvasBoardProps {
  selectedTool?: ToolType;
}

export const CanvasBoard: React.FC<CanvasBoardProps> = ({ selectedTool }) => {
  const boardRef = useRef<HTMLDivElement>(null);
  const [items, setItems] = useState<CanvasElement[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Pan & zoom state
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  // Tracking which text is editing
  const [editingTextId, setEditingTextId] = useState<string | null>(null);

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
    // Slow down zoom step: ±3% per wheel event
    let newZoom = zoom * (e.deltaY < 0 ? 1.03 : 0.97);
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

  // Helper: Center view based on current elements
  const centerElementsInView = () => {
    if (!boardRef.current || items.length === 0) {
      // No items: center at origin
      setPan({ x: 0, y: 0 });
      setZoom(1);
      return;
    }
    // Compute bounding box of all items
    const padding = 40; // px padding around elements
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const item of items) {
      // All items are size 120x40 minimum, plus 12px padding
      const width = 120 + 24, height = 40 + 24;
      minX = Math.min(minX, item.x - 12);
      maxX = Math.max(maxX, item.x - 12 + width);
      minY = Math.min(minY, item.y - 12);
      maxY = Math.max(maxY, item.y - 12 + height);
    }
    const elWidth = maxX - minX;
    const elHeight = maxY - minY;

    const boardRect = boardRef.current.getBoundingClientRect();
    const { width: viewW, height: viewH } = boardRect;

    // Determine zoom so everything fits, max 1.0
    const zoomX = (viewW - padding * 2) / elWidth;
    const zoomY = (viewH - padding * 2) / elHeight;
    const newZoom = Math.min(1, Math.max(0.2, Math.min(zoomX, zoomY)));

    // Center the bounding box in the canvas at newZoom
    const centerX = (minX + maxX) / 2, centerY = (minY + maxY) / 2;
    const viewCenterX = viewW / 2, viewCenterY = viewH / 2;

    setPan({
      x: viewCenterX - centerX * newZoom,
      y: viewCenterY - centerY * newZoom,
    });
    setZoom(newZoom);
  };

  // Reset zoom and center
  const handleResetZoom = () => {
    centerElementsInView();
  };

  // Background is tabIndex for accessibility and focus handlers
  const handleCanvasClick = (e: React.MouseEvent) => {
    // Only respond if text tool is selected
    if (selectedTool !== "text") {
      setSelectedId(null);
      return;
    }

    // Clicking with text tool: create new text box at this position
    if (boardRef.current) {
      const boardRect = boardRef.current.getBoundingClientRect();
      const mouseX = e.clientX - boardRect.left;
      const mouseY = e.clientY - boardRect.top;
      const x = (mouseX - pan.x) / zoom;
      const y = (mouseY - pan.y) / zoom;
      const newId = uuidv4();

      setItems((prev) => [
        ...prev,
        {
          id: newId,
          x,
          y,
          type: "text",
          content: "",
          isEditing: true,
        },
      ]);
      setSelectedId(newId);
      setEditingTextId(newId);
      e.stopPropagation();
    }
  };

  // When clicking anywhere else (background), stop editing any text
  const handleBackgroundPointerDown = (e: React.MouseEvent) => {
    if (editingTextId) {
      // If a text is being edited, finish the edit
      finishTextEdit(editingTextId);
    } else {
      setSelectedId(null);
    }
  };

  // Called by EditableTextItem/CanvasItem when editing finishes
  const finishTextEdit = (id: string) => {
    setItems((prev) =>
      prev
        .map((el) =>
          el.id === id
            ? {
                ...el,
                isEditing: false,
                // Clean up empty boxes
                content: el.content.trim(),
              }
            : el,
        )
        .filter((el) => el.id !== id || el.content.trim() !== ""),
    );
    setEditingTextId(null);
    setSelectedId(null);
  };

  // Called by EditableTextItem to set content
  const handleTextContentChange = (id: string, content: string) => {
    setItems((prev) =>
      prev.map((el) => (el.id === id ? { ...el, content } : el)),
    );
  };

  // Handle double click on CanvasItem to make a text box editable again
  const handleItemDoubleClick = (id: string, type: string) => {
    if (type === "text") {
      setItems((prev) =>
        prev.map((el) =>
          el.id === id ? { ...el, isEditing: true } : el,
        ),
      );
      setEditingTextId(id);
      setSelectedId(id);
    }
  };

  // Also stop editing when switching away from text tool
  React.useEffect(() => {
    if (selectedTool !== "text" && editingTextId) {
      finishTextEdit(editingTextId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTool]);

  return (
    <div
      ref={boardRef}
      className="relative w-full h-full bg-gray-50 overflow-hidden"
      style={{ minHeight: 400, touchAction: "none", cursor: selectedTool === "text" ? "text" : isPanning ? "grabbing" : "default" }}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      tabIndex={0}
      onClick={handleCanvasClick}
      onPointerDown={handleBackgroundPointerDown}
      onMouseDown={handleMouseDown}
      onWheel={handleWheel}
      aria-label="Canvas Board"
    >
      {/* Zoom UI */}
      <div className="absolute top-2 right-2 z-20 flex items-center gap-2 shadow-sm bg-white/90 rounded px-3 py-1 border">
        <span className="text-sm font-medium">
          Zoom: {(zoom * 100).toFixed(0)}%
        </span>
        <Button
          size="icon"
          variant="ghost"
          className="ml-1"
          title="Reset Zoom & Center"
          onClick={handleResetZoom}
          type="button"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>
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
        {items.map((item) => {
          // Text element, editing state
          if (item.type === "text" && item.isEditing) {
            return (
              <div
                key={item.id}
                style={{ position: "absolute", left: item.x, top: item.y, zIndex: 10, pointerEvents: "auto" }}
                tabIndex={0}
                onClick={e => e.stopPropagation()}
              >
                <EditableTextItem
                  value={item.content}
                  onChange={val => handleTextContentChange(item.id, val)}
                  onFinishEdit={() => finishTextEdit(item.id)}
                  autoFocus={true}
                />
              </div>
            );
          }
          // Otherwise, normal display+move element (CanvasItem)
          return (
            <CanvasItem
              key={item.id}
              id={item.id}
              x={item.x}
              y={item.y}
              content={
                item.type === "text"
                  ? (
                    <span className="text-base leading-snug break-words">{item.content || " "}</span>
                  )
                  : <span>[{item.type}]</span>
              }
              onMove={handleMove}
              isSelected={selectedId === item.id}
              onSelect={setSelectedId}
              canvasPanZoom={{ pan, zoom }}
              onDoubleClick={() => handleItemDoubleClick(item.id, item.type)}
            />
          );
        })}
      </div>
    </div>
  );
};
