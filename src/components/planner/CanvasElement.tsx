
import { useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, RotateCw } from 'lucide-react';
import { ElementResizer } from './ElementResizer';
import type { Database } from '@/integrations/supabase/types';

type CanvasElementType = Database['public']['Tables']['canvas_elements']['Row'];

interface CanvasElementProps {
  element: CanvasElementType;
  isSelected: boolean;
  onSelect: (id: string | null) => void;
  onUpdate: (id: string, updates: Partial<CanvasElementType>) => void;
  onDelete: (id: string) => void;
}

export const CanvasElement = ({
  element,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
}: CanvasElementProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, elementX: 0, elementY: 0 });
  const elementRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDragging(true);
    setDragStart({
      x: e.clientX,
      y: e.clientY,
      elementX: element.position_x,
      elementY: element.position_y,
    });
    onSelect(element.id);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;
      
      onUpdate(element.id, {
        position_x: dragStart.elementX + deltaX,
        position_y: dragStart.elementY + deltaY,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleResize = (width: number, height: number) => {
    onUpdate(element.id, { width, height });
  };

  const getAspectRatio = () => {
    if (element.element_type === 'image') {
      return (element.width || 200) / (element.height || 100);
    }
    return undefined;
  };

  const renderElementContent = () => {
    const properties = element.properties as any;

    switch (element.element_type) {
      case 'text':
        return (
          <div className="p-3 h-full">
            <p className="text-sm break-words">{properties.content || 'Text Element'}</p>
          </div>
        );

      case 'yarn':
        return (
          <div className="p-3 flex items-center space-x-3 h-full">
            {properties.image_url && (
              <img
                src={properties.image_url}
                alt={properties.name}
                className="w-12 h-12 rounded object-cover flex-shrink-0"
              />
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">{properties.name}</p>
              <p className="text-xs text-gray-600 truncate">{properties.brand} - {properties.color}</p>
              <p className="text-xs text-gray-500">{properties.remaining_yardage} yds</p>
            </div>
          </div>
        );

      case 'swatch':
        return (
          <div className="p-3 h-full">
            <p className="text-sm font-medium mb-1">{properties.title}</p>
            {properties.description && (
              <p className="text-xs text-gray-600 mb-2 line-clamp-2">{properties.description}</p>
            )}
            {properties.hook_size && (
              <p className="text-xs text-gray-500">Hook: {properties.hook_size}</p>
            )}
            {(properties.stitches_per_inch || properties.rows_per_inch) && (
              <p className="text-xs text-gray-500 mt-1">
                {properties.stitches_per_inch && `${properties.stitches_per_inch} st/in`}
                {properties.stitches_per_inch && properties.rows_per_inch && ' × '}
                {properties.rows_per_inch && `${properties.rows_per_inch} rows/in`}
              </p>
            )}
          </div>
        );

      case 'image':
        return (
          <div className="p-2 h-full">
            {properties.url ? (
              <img
                src={properties.url}
                alt="Canvas image"
                className="w-full h-full object-cover rounded"
              />
            ) : (
              <div className="w-full h-full bg-gray-100 rounded flex items-center justify-center">
                <p className="text-xs text-gray-500">No image</p>
              </div>
            )}
          </div>
        );

      case 'link':
        return (
          <div className="p-3 h-full flex items-center">
            <a
              href={properties.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline truncate"
              onClick={(e) => e.stopPropagation()}
            >
              {properties.title || properties.url || 'Link'}
            </a>
          </div>
        );

      default:
        return (
          <div className="p-3 h-full">
            <p className="text-sm">Unknown element type</p>
          </div>
        );
    }
  };

  const elementContent = (
    <Card className="w-full h-full bg-white shadow-sm border">
      <CardContent className="p-0 h-full">
        {renderElementContent()}
      </CardContent>
    </Card>
  );

  return (
    <div
      ref={elementRef}
      className={`absolute cursor-move select-none ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
      style={{
        left: element.position_x,
        top: element.position_y,
        transform: `rotate(${element.rotation || 0}deg)`,
        zIndex: element.z_index || 0,
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {isSelected ? (
        <ElementResizer
          width={element.width || 200}
          height={element.height || 100}
          onResize={handleResize}
          aspectRatio={getAspectRatio()}
        >
          {elementContent}
        </ElementResizer>
      ) : (
        <div style={{ width: element.width || 200, height: element.height || 100 }}>
          {elementContent}
        </div>
      )}

      {/* Selection controls */}
      {isSelected && (
        <div className="absolute -top-8 right-0 flex space-x-1">
          <Button
            size="sm"
            variant="outline"
            className="h-6 w-6 p-0"
            onClick={(e) => {
              e.stopPropagation();
              onUpdate(element.id, {
                rotation: (element.rotation || 0) + 15,
              });
            }}
          >
            <RotateCw className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="destructive"
            className="h-6 w-6 p-0"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(element.id);
            }}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  );
};
