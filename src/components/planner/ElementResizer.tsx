
import { useState, useRef } from 'react';

interface ElementResizerProps {
  width: number;
  height: number;
  onResize: (width: number, height: number) => void;
  aspectRatio?: number;
  children: React.ReactNode;
}

export const ElementResizer = ({ 
  width, 
  height, 
  onResize, 
  aspectRatio,
  children 
}: ElementResizerProps) => {
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const startPos = useRef({ x: 0, y: 0, width: 0, height: 0 });

  const handleMouseDown = (e: React.MouseEvent, handle: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsResizing(true);
    setResizeHandle(handle);
    
    startPos.current = {
      x: e.clientX,
      y: e.clientY,
      width,
      height,
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      
      const deltaX = e.clientX - startPos.current.x;
      const deltaY = e.clientY - startPos.current.y;
      
      let newWidth = width;
      let newHeight = height;
      
      if (handle.includes('right')) {
        newWidth = Math.max(50, startPos.current.width + deltaX);
      }
      if (handle.includes('left')) {
        newWidth = Math.max(50, startPos.current.width - deltaX);
      }
      if (handle.includes('bottom')) {
        newHeight = Math.max(30, startPos.current.height + deltaY);
      }
      if (handle.includes('top')) {
        newHeight = Math.max(30, startPos.current.height - deltaY);
      }
      
      // Maintain aspect ratio if specified
      if (aspectRatio && (handle.includes('corner') || handle === 'bottom-right')) {
        if (handle.includes('right') || handle.includes('bottom')) {
          newHeight = newWidth / aspectRatio;
        } else {
          newWidth = newHeight * aspectRatio;
        }
      }
      
      onResize(newWidth, newHeight);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      setResizeHandle(null);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div className="relative" style={{ width, height }}>
      {children}
      
      {/* Resize handles */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Corner handles */}
        <div
          className="absolute -top-1 -left-1 w-2 h-2 bg-blue-500 border border-white rounded-sm cursor-nw-resize pointer-events-auto"
          onMouseDown={(e) => handleMouseDown(e, 'top-left')}
        />
        <div
          className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 border border-white rounded-sm cursor-ne-resize pointer-events-auto"
          onMouseDown={(e) => handleMouseDown(e, 'top-right')}
        />
        <div
          className="absolute -bottom-1 -left-1 w-2 h-2 bg-blue-500 border border-white rounded-sm cursor-sw-resize pointer-events-auto"
          onMouseDown={(e) => handleMouseDown(e, 'bottom-left')}
        />
        <div
          className="absolute -bottom-1 -right-1 w-2 h-2 bg-blue-500 border border-white rounded-sm cursor-se-resize pointer-events-auto"
          onMouseDown={(e) => handleMouseDown(e, 'bottom-right')}
        />
        
        {/* Edge handles */}
        <div
          className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-blue-500 border border-white rounded-sm cursor-n-resize pointer-events-auto"
          onMouseDown={(e) => handleMouseDown(e, 'top')}
        />
        <div
          className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-blue-500 border border-white rounded-sm cursor-s-resize pointer-events-auto"
          onMouseDown={(e) => handleMouseDown(e, 'bottom')}
        />
        <div
          className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-blue-500 border border-white rounded-sm cursor-w-resize pointer-events-auto"
          onMouseDown={(e) => handleMouseDown(e, 'left')}
        />
        <div
          className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-blue-500 border border-white rounded-sm cursor-e-resize pointer-events-auto"
          onMouseDown={(e) => handleMouseDown(e, 'right')}
        />
      </div>
    </div>
  );
};
