
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
  const canvasRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchElements();
  }, [planId]);

  const fetchElements = async () => {
    try {
      const { data, error } = await supabase
        .from('canvas_elements')
        .select('*')
        .eq('plan_id', planId)
        .order('z_index', { ascending: true });

      if (error) throw error;
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
    if (e.target === canvasRef.current) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - canvasState.panX, y: e.clientY - canvasState.panY });
      setSelectedElementId(null);
    }
  }, [canvasState.panX, canvasState.panY]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging) {
      setCanvasState(prev => ({
        ...prev,
        panX: e.clientX - dragStart.x,
        panY: e.clientY - dragStart.y,
      }));
    }
  }, [isDragging, dragStart]);

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

  const updateElement = async (elementId: string, updates: Partial<CanvasElementType>) => {
    try {
      const { error } = await supabase
        .from('canvas_elements')
        .update(updates)
        .eq('id', elementId);

      if (error) throw error;

      setElements(prev => prev.map(el => 
        el.id === elementId ? { ...el, ...updates } : el
      ));
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
      const { error } = await supabase
        .from('canvas_elements')
        .delete()
        .eq('id', elementId);

      if (error) throw error;

      setElements(prev => prev.filter(el => el.id !== elementId));
      setSelectedElementId(null);
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
    properties: any;
  }) => {
    try {
      const { data, error } = await supabase
        .from('canvas_elements')
        .insert({
          plan_id: planId,
          ...elementData,
        })
        .select()
        .single();

      if (error) throw error;
      setElements(prev => [...prev, data]);
    } catch (error: any) {
      console.error('Error adding element:', error);
      toast({
        title: "Error",
        description: "Failed to add element",
        variant: "destructive",
      });
    }
  };

  return (
    <div 
      ref={canvasRef}
      className="w-full h-full overflow-hidden bg-white relative cursor-grab active:cursor-grabbing"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onWheel={handleWheel}
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

      {/* Canvas controls */}
      <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-2 space-y-2">
        <button
          onClick={() => setCanvasState(prev => ({ ...prev, zoom: Math.min(3, prev.zoom * 1.2) }))}
          className="block w-8 h-8 text-center text-sm border rounded hover:bg-gray-50"
        >
          +
        </button>
        <div className="text-xs text-center text-gray-600">
          {Math.round(canvasState.zoom * 100)}%
        </div>
        <button
          onClick={() => setCanvasState(prev => ({ ...prev, zoom: Math.max(0.1, prev.zoom * 0.8) }))}
          className="block w-8 h-8 text-center text-sm border rounded hover:bg-gray-50"
        >
          -
        </button>
      </div>
    </div>
  );
};
