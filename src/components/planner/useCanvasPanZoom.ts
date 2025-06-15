
import { useState, useRef, useEffect } from "react";

export function useCanvasPanZoom({
  boardRef,
  initialZoom = 1,
  initialPan = { x: 0, y: 0 },
}: {
  boardRef: React.RefObject<HTMLDivElement>;
  initialZoom?: number;
  initialPan?: { x: number; y: number };
}) {
  const [pan, setPan] = useState(initialPan);
  const [zoom, setZoom] = useState(initialZoom);

  const [isPanning, setIsPanning] = useState(false);
  const panOrigin = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Mouse down to start panning
  const handleMouseDown = (e: React.MouseEvent, selectedTool?: string) => {
    if (e.button !== 0) return;
    if ((e.target as Element) !== boardRef.current) return;
    if (selectedTool !== "move") return;
    setIsPanning(true);
    panOrigin.current = {
      x: e.clientX - pan.x,
      y: e.clientY - pan.y,
    };
  };

  // Handle panning movement
  useEffect(() => {
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

  // Mouse wheel for zoom
  const handleWheel = (e: React.WheelEvent) => {
    if (!(e.ctrlKey || e.metaKey)) return;
    e.preventDefault();
    const boardRect = boardRef.current?.getBoundingClientRect();
    if (!boardRect) return;
    const mouseX = e.clientX - boardRect.left;
    const mouseY = e.clientY - boardRect.top;
    const prevZoom = zoom;
    let newZoom = zoom * (e.deltaY < 0 ? 1.03 : 0.97);
    newZoom = Math.max(0.2, Math.min(3, newZoom));
    setPan(prev => ({
      x: mouseX - ((mouseX - prev.x) * (newZoom / prevZoom)),
      y: mouseY - ((mouseY - prev.y) * (newZoom / prevZoom)),
    }));
    setZoom(newZoom);
  };

  return {
    pan,
    zoom,
    setPan,
    setZoom,
    isPanning,
    handleMouseDown,
    handleWheel,
  };
}
