
import React, { useRef, useState, useEffect } from "react";
import { CanvasItem } from "./CanvasItem";
import { v4 as uuidv4 } from "uuid";
import { Button } from "@/components/ui/button";
import type { ToolType } from "./ToolsToolbar";
import { EditableTextItem } from "./EditableTextItem";
import { CanvasElement, CanvasElements, CanvasBoardProps } from "./canvasTypes";
import { useCanvasPanZoom } from "./useCanvasPanZoom";
import { useCanvasSelection } from "./useCanvasSelection";
import { CanvasZoomPanel } from "./CanvasZoomPanel";
import { useAutoSave } from "./useAutoSave";
import { CanvasSaveStatus } from "./CanvasSaveStatus";
import { supabase } from "@/integrations/supabase/client";

export const CanvasBoard: React.FC<CanvasBoardProps & { planId?: string }> = ({
  selectedTool,
  planId,
}) => {
  const boardRef = React.useRef<HTMLDivElement>(null);
  const [items, setItems] = React.useState<CanvasElements>([]);
  // Move pan/zoom logic to hook
  const {
    pan, zoom, setPan, setZoom, isPanning, handleMouseDown, handleWheel
  } = useCanvasPanZoom({ boardRef });

  // Selection state logic to hook
  const { selectedId, handleSelect, deselect } = useCanvasSelection();

  // Text editing
  const [editingTextId, setEditingTextId] = React.useState<string | null>(null);

  // Load initial canvas on mount
  useEffect(() => {
    if (!planId) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase.from("plans").select("canvas_data").eq("id", planId).maybeSingle();
      if (!cancelled && data?.canvas_data) {
        setItems(data.canvas_data as CanvasElements);
      }
    })();
    return () => { cancelled = true };
  }, [planId]);

  // Auto-save hook
  const { status: saveStatus, error: saveError } = useAutoSave({
    planId: planId || "",
    elements: items,
    debounceMs: 1200,
  });

  // Double click guard
  const justDoubleClicked = React.useRef(false);

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

  const handleMove = (id: string, x: number, y: number) => {
    setItems(items => items.map(item =>
      item.id === id ? { ...item, x, y } : item
    ));
  };

  // Center view based on current elements
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
  const handleResetZoom = () => centerElementsInView();

  // Background is tabIndex for accessibility and focus handlers
  const handleCanvasClick = (e: React.MouseEvent) => {
    // Only allow text creation if text tool is selected
    if (selectedTool === "text") {
      // Double-click hack: don't trigger after doubleclick event
      if (justDoubleClicked.current) {
        // Reset the flag here, next click is valid again.
        justDoubleClicked.current = false;
        return;
      }
      // Only act if clicking directly the background, not another element (like a text box)
      if (e.target !== e.currentTarget) {
        return;
      }
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
        handleSelect(newId, selectedTool!);
        setEditingTextId(newId);
        e.stopPropagation();
      }
    } else if (selectedTool === "move") {
      // Deselect any selection if clicking empty canvas
      if (e.target === e.currentTarget) {
        deselect();
      }
    } else {
      // For other tools, deselect
      deselect();
    }
  };

  // When clicking anywhere else (background), stop editing any text
  const handleBackgroundPointerDown = (e: React.MouseEvent) => {
    if (editingTextId) {
      // If a text is being edited, finish the edit
      finishTextEdit(editingTextId);
    } else if (selectedTool === "move") {
      deselect();
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
    deselect();
  };

  // Called by EditableTextItem to set content
  const handleTextContentChange = (id: string, content: string) => {
    setItems((prev) =>
      prev.map((el) => (el.id === id ? { ...el, content } : el)),
    );
  };

  // Handle double click on CanvasItem to make a text box editable again
  // Set the justDoubleClicked flag and clear it after a short time (e.g., 10ms)
  const handleItemDoubleClick = (id: string, type: string) => {
    if (type === "text") {
      justDoubleClicked.current = true;
      setTimeout(() => {
        justDoubleClicked.current = false;
      }, 10);
      setItems((prev) =>
        prev.map((el) =>
          el.id === id ? { ...el, isEditing: true } : el,
        ),
      );
      setEditingTextId(id);
      handleSelect(id, selectedTool!);
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
      onMouseDown={e => handleMouseDown(e, selectedTool)}
      onWheel={handleWheel}
      aria-label="Canvas Board"
    >
      {/* Zoom UI */}
      <CanvasZoomPanel zoom={zoom} onReset={handleResetZoom} />

      {/* Save status */}
      <CanvasSaveStatus status={saveStatus} error={saveError} />

      <div
        style={{
          transform: `translate(${pan.x}px,${pan.y}px) scale(${zoom})`,
          transformOrigin: "0 0",
          width: "100%",
          height: "100%",
          position: "absolute",
          left: 0,
          top: 0,
          pointerEvents: "none",
        }}
      >
        {items.map((item) => {
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
              onMove={
                selectedTool === "move"
                  ? handleMove
                  : () => {}
              }
              isSelected={selectedId === item.id}
              onSelect={id => handleSelect(id, selectedTool!)}
              canvasPanZoom={{ pan, zoom }}
              onDoubleClick={() => handleItemDoubleClick(item.id, item.type)}
            />
          );
        })}
      </div>
    </div>
  );
};
