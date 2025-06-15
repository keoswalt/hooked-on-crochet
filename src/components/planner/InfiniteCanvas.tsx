
import { useState, useRef, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CanvasElement } from './CanvasElement';
import type { Database } from '@/integrations/supabase/types';

type CanvasElementType = Database['public']['Tables']['canvas_elements']['Row'];

interface InfiniteCanvasProps {
  userId: string;
  planId: string;
}

interface CanvasState {
  zoom: number;
  panX: number;
  panY: number;
}

export const InfiniteCanvas = ({ userId, planId }: InfiniteCanvasProps) => {
  const [elements, setElements] = useState<CanvasElementType[]>([]);
  const [canvasState, setCanvasState] = useState<CanvasState>({
    zoom: 1,
    panX: 0,
    panY: 0,
  });
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessingDrop, setIsProcessingDrop] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchElements();
  }, [planId]);

  const fetchElements = async () => {
    try {
      console.log('Fetching elements for plan:', planId);
      const { data, error } = await supabase
        .from('canvas_elements')
        .select('*')
        .eq('plan_id', planId)
        .order('z_index', { ascending: true });

      if (error) {
        console.error('Error fetching elements:', error);
        throw error;
      }
      
      console.log('Fetched elements:', data?.length || 0);
      setElements(data || []);
    } catch (error: any) {
      console.error('Error fetching elements:', error);
      toast({
        title: "Error",
        description: "Failed to load canvas elements",
        variant: "destructive",
      });
    }
  };

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.target === canvasRef.current && !isProcessingDrop) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - canvasState.panX, y: e.clientY - canvasState.panY });
      setSelectedElementId(null);
    }
  }, [canvasState.panX, canvasState.panY, isProcessingDrop]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging && !isProcessingDrop) {
      setCanvasState(prev => ({
        ...prev,
        panX: e.clientX - dragStart.x,
        panY: e.clientY - dragStart.y,
      }));
    }
  }, [isDragging, dragStart, isProcessingDrop]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    setCanvasState(prev => ({
      ...prev,
      zoom: Math.max(0.1, Math.min(3, prev.zoom * zoomFactor)),
    }));
  }, []);

  // Improved coordinate conversion with better validation
  const screenToCanvasCoords = useCallback((screenX: number, screenY: number) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) {
      console.warn('Canvas rect not available for coordinate conversion');
      return { x: 0, y: 0 };
    }

    // Convert screen coordinates to canvas coordinates
    const canvasX = (screenX - rect.left - canvasState.panX) / canvasState.zoom;
    const canvasY = (screenY - rect.top - canvasState.panY) / canvasState.zoom;
    
    console.log('Coordinate conversion:', {
      screen: { x: screenX, y: screenY },
      rect: { left: rect.left, top: rect.top },
      canvasState: { panX: canvasState.panX, panY: canvasState.panY, zoom: canvasState.zoom },
      canvas: { x: canvasX, y: canvasY }
    });
    
    return { x: canvasX, y: canvasY };
  }, [canvasState]);

  // Handle drag and drop from drawer
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    if (!canvasRef.current?.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    setIsProcessingDrop(true);

    try {
      console.log('Drop event triggered');
      
      // Validate plan ID
      if (!planId) {
        throw new Error('No plan ID available');
      }

      const dragDataString = e.dataTransfer.getData('application/json');
      if (!dragDataString) {
        throw new Error('No drag data found');
      }

      const dragData = JSON.parse(dragDataString);
      console.log('Drag data:', dragData);
      
      const { type, data } = dragData;
      
      if (!type) {
        throw new Error('No element type specified');
      }
      
      const canvasCoords = screenToCanvasCoords(e.clientX, e.clientY);
      
      // Validate coordinates
      if (isNaN(canvasCoords.x) || isNaN(canvasCoords.y)) {
        throw new Error('Invalid coordinates calculated');
      }
      
      let elementData: any = {
        element_type: type,
        position_x: Math.round(canvasCoords.x),
        position_y: Math.round(canvasCoords.y),
        width: 200,
        height: 100,
        properties: {},
      };

      // Set element-specific properties and dimensions
      switch (type) {
        case 'text':
          elementData.properties = { content: data?.content || 'New Text' };
          elementData.height = 60;
          break;
        case 'yarn':
          elementData.properties = {
            name: data?.name || 'Unknown Yarn',
            brand: data?.brand || '',
            color: data?.color || '',
            image_url: data?.image_url || '',
            remaining_yardage: data?.remaining_yardage || data?.yardage || 0,
          };
          elementData.height = 120;
          break;
        case 'swatch':
          elementData.properties = {
            title: data?.title || 'Untitled Swatch',
            description: data?.description || '',
            hook_size: data?.hook_size || '',
            stitches_per_inch: data?.stitches_per_inch || null,
            rows_per_inch: data?.rows_per_inch || null,
          };
          elementData.height = 140;
          break;
        case 'image':
          elementData.properties = { url: data?.url || '' };
          elementData.width = 300;
          elementData.height = 200;
          break;
        case 'link':
          elementData.properties = { 
            url: data?.url || 'https://example.com', 
            title: data?.title || 'New Link' 
          };
          elementData.height = 80;
          break;
        default:
          elementData.properties = data || {};
      }

      console.log('Prepared element data:', elementData);

      await addElement(elementData);
      
      toast({
        title: "Element added",
        description: `${type.charAt(0).toUpperCase() + type.slice(1)} element added to canvas`,
      });
      
      console.log('Element successfully added to canvas');
    } catch (error: any) {
      console.error('Error handling drop:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add element to canvas",
        variant: "destructive",
      });
    } finally {
      setIsProcessingDrop(false);
    }
  }, [canvasState, planId, screenToCanvasCoords, toast]);

  const updateElement = async (elementId: string, updates: Partial<CanvasElementType>) => {
    try {
      console.log('Updating element:', elementId, updates);
      const { error } = await supabase
        .from('canvas_elements')
        .update(updates)
        .eq('id', elementId);

      if (error) {
        console.error('Database error updating element:', error);
        throw error;
      }

      setElements(prev => prev.map(el => 
        el.id === elementId ? { ...el, ...updates } : el
      ));
      console.log('Element updated successfully');
    } catch (error: any) {
      console.error('Error updating element:', error);
      toast({
        title: "Error",
        description: "Failed to update element",
        variant: "destructive",
      });
    }
  };

  const deleteElement = async (elementId: string) => {
    try {
      console.log('Deleting element:', elementId);
      const { error } = await supabase
        .from('canvas_elements')
        .delete()
        .eq('id', elementId);

      if (error) {
        console.error('Database error deleting element:', error);
        throw error;
      }

      setElements(prev => prev.filter(el => el.id !== elementId));
      setSelectedElementId(null);
      console.log('Element deleted successfully');
    } catch (error: any) {
      console.error('Error deleting element:', error);
      toast({
        title: "Error",
        description: "Failed to delete element",
        variant: "destructive",
      });
    }
  };

  const addElement = async (elementData: {
    element_type: string;
    position_x: number;
    position_y: number;
    width: number;
    height: number;
    properties: any;
  }) => {
    try {
      console.log('Adding element to database:', elementData);
      
      const { data, error } = await supabase
        .from('canvas_elements')
        .insert({
          plan_id: planId,
          ...elementData,
        })
        .select()
        .single();

      if (error) {
        console.error('Database error inserting element:', error);
        throw error;
      }
      
      console.log('Element inserted successfully:', data);
      setElements(prev => [...prev, data]);
      return data;
    } catch (error: any) {
      console.error('Error adding element:', error);
      throw error;
    }
  };

  return (
    <div 
      ref={canvasRef}
      className={`w-full h-full overflow-hidden bg-white relative cursor-grab active:cursor-grabbing ${
        isDragOver ? 'bg-blue-50 ring-2 ring-blue-300 ring-opacity-50' : ''
      } ${isProcessingDrop ? 'pointer-events-none' : ''}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onWheel={handleWheel}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{
        backgroundImage: `radial-gradient(circle, #e5e7eb 1px, transparent 1px)`,
        backgroundSize: `${20 * canvasState.zoom}px ${20 * canvasState.zoom}px`,
        backgroundPosition: `${canvasState.panX}px ${canvasState.panY}px`,
      }}
    >
      <div
        style={{
          transform: `translate(${canvasState.panX}px, ${canvasState.panY}px) scale(${canvasState.zoom})`,
          transformOrigin: '0 0',
        }}
      >
        {elements.map((element) => (
          <CanvasElement
            key={element.id}
            element={element}
            isSelected={selectedElementId === element.id}
            onSelect={setSelectedElementId}
            onUpdate={updateElement}
            onDelete={deleteElement}
          />
        ))}
      </div>

      {/* Drop indicator */}
      {isDragOver && (
        <div className="absolute inset-0 bg-blue-100 bg-opacity-20 border-2 border-dashed border-blue-400 flex items-center justify-center pointer-events-none">
          <div className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg">
            Drop element here
          </div>
        </div>
      )}

      {/* Processing indicator */}
      {isProcessingDrop && (
        <div className="absolute inset-0 bg-gray-100 bg-opacity-50 flex items-center justify-center pointer-events-none">
          <div className="bg-white text-gray-700 px-4 py-2 rounded-lg shadow-lg">
            Adding element...
          </div>
        </div>
      )}

      {/* Canvas controls */}
      <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-2 space-y-2">
        <button
          onClick={() => setCanvasState(prev => ({ ...prev, zoom: Math.min(3, prev.zoom * 1.2) }))}
          className="block w-8 h-8 text-center text-sm border rounded hover:bg-gray-50"
          disabled={isProcessingDrop}
        >
          +
        </button>
        <div className="text-xs text-center text-gray-600">
          {Math.round(canvasState.zoom * 100)}%
        </div>
        <button
          onClick={() => setCanvasState(prev => ({ ...prev, zoom: Math.max(0.1, prev.zoom * 0.8) }))}
          className="block w-8 h-8 text-center text-sm border rounded hover:bg-gray-50"
          disabled={isProcessingDrop}
        >
          -
        </button>
      </div>
    </div>
  );
};
