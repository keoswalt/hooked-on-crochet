
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

  // Debug authentication state
  const checkAuthState = async () => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      console.log('=== Authentication Debug ===');
      console.log('Session:', session);
      console.log('Session error:', sessionError);
      console.log('User:', user);
      console.log('User error:', userError);
      console.log('User ID from props:', userId);
      console.log('Plan ID:', planId);
      console.log('========================');
      
      if (!session || !user) {
        console.error('No active session or user found');
        toast({
          title: "Authentication Error",
          description: "Please log in to add elements to the canvas",
          variant: "destructive",
        });
        return false;
      }
      
      if (user.id !== userId) {
        console.error('User ID mismatch:', { authUserId: user.id, propsUserId: userId });
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error checking auth state:', error);
      return false;
    }
  };

  useEffect(() => {
    fetchElements();
    // Check auth state on component mount
    checkAuthState();
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
      console.log('🖱️ Mouse down on canvas - starting pan');
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
    if (isDragging) {
      console.log('🖱️ Mouse up - ending pan');
      setIsDragging(false);
    }
  }, [isDragging]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    setCanvasState(prev => ({
      ...prev,
      zoom: Math.max(0.1, Math.min(3, prev.zoom * zoomFactor)),
    }));
  }, []);

  const screenToCanvasCoords = useCallback((screenX: number, screenY: number) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) {
      console.warn('Canvas rect not available for coordinate conversion');
      return { x: 0, y: 0 };
    }

    const canvasX = (screenX - rect.left - canvasState.panX) / canvasState.zoom;
    const canvasY = (screenY - rect.top - canvasState.panY) / canvasState.zoom;
    
    console.log('📍 Coordinate conversion:', {
      screen: { x: screenX, y: screenY },
      rect: { left: rect.left, top: rect.top, width: rect.width, height: rect.height },
      canvasState: { panX: canvasState.panX, panY: canvasState.panY, zoom: canvasState.zoom },
      canvas: { x: canvasX, y: canvasY }
    });
    
    return { x: canvasX, y: canvasY };
  }, [canvasState]);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    console.log('🎯 Drag enter canvas');
    setIsDragOver(true);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    // Don't log every dragover event as it's too noisy
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    // Only set dragOver to false if we're leaving the canvas container entirely
    if (!canvasRef.current?.contains(e.relatedTarget as Node)) {
      console.log('🎯 Drag leave canvas (actually leaving)');
      setIsDragOver(false);
    }
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    setIsProcessingDrop(true);

    console.log('=== 🎯 DROP EVENT TRIGGERED ===');
    console.log('Drop position:', { clientX: e.clientX, clientY: e.clientY });
    console.log('Canvas ref:', canvasRef.current);

    try {
      // Step 1: Check authentication first
      const isAuthenticated = await checkAuthState();
      if (!isAuthenticated) {
        throw new Error('Authentication failed - user not logged in');
      }
      
      // Validate plan ID
      if (!planId) {
        throw new Error('No plan ID available');
      }

      const dragDataString = e.dataTransfer.getData('application/json');
      if (!dragDataString) {
        throw new Error('No drag data found');
      }

      const dragData = JSON.parse(dragDataString);
      console.log('📦 Drag data:', dragData);
      
      const { type, data } = dragData;
      
      if (!type) {
        throw new Error('No element type specified');
      }
      
      const canvasCoords = screenToCanvasCoords(e.clientX, e.clientY);
      
      if (isNaN(canvasCoords.x) || isNaN(canvasCoords.y)) {
        throw new Error('Invalid coordinates calculated');
      }
      
      console.log('📍 Final drop coordinates:', canvasCoords);
      
      let elementData: any = {
        element_type: type,
        position_x: Math.round(canvasCoords.x),
        position_y: Math.round(canvasCoords.y),
        width: 200,
        height: 100,
        properties: {},
      };

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

      console.log('🔧 Prepared element data:', elementData);

      await addElement(elementData);
      
      toast({
        title: "Element added",
        description: `${type.charAt(0).toUpperCase() + type.slice(1)} element added to canvas`,
      });
      
      console.log('✅ Element successfully added to canvas');
      console.log('=================================');
    } catch (error: any) {
      console.error('=== ❌ Drop Error ===');
      console.error('Error details:', error);
      console.error('Error message:', error.message);
      console.error('===================');
      
      toast({
        title: "Error",
        description: error.message || "Failed to add element to canvas",
        variant: "destructive",
      });
    } finally {
      setIsProcessingDrop(false);
    }
  }, [canvasState, planId, screenToCanvasCoords, toast]);

  const addElement = async (elementData: {
    element_type: string;
    position_x: number;
    position_y: number;
    width: number;
    height: number;
    properties: any;
  }) => {
    try {
      console.log('=== Database Insert Debug ===');
      console.log('Attempting to insert element:', elementData);
      console.log('Plan ID:', planId);
      
      // Step 2: Test RLS policy with a direct query first
      console.log('Testing plan access...');
      const { data: planTest, error: planError } = await supabase
        .from('plans')
        .select('id, user_id')
        .eq('id', planId)
        .single();
      
      console.log('Plan test result:', planTest);
      console.log('Plan test error:', planError);
      
      if (planError) {
        throw new Error(`Cannot access plan: ${planError.message}`);
      }
      
      if (!planTest) {
        throw new Error('Plan not found or access denied');
      }
      
      // Step 3: Attempt the insert with detailed error logging
      const insertPayload = {
        plan_id: planId,
        ...elementData,
      };
      
      console.log('Final insert payload:', insertPayload);
      
      const { data, error } = await supabase
        .from('canvas_elements')
        .insert(insertPayload)
        .select()
        .single();

      console.log('Insert result:', data);
      console.log('Insert error:', error);
      
      if (error) {
        console.error('Database insert error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw new Error(`Database error: ${error.message}`);
      }
      
      if (!data) {
        throw new Error('Insert succeeded but no data returned');
      }
      
      console.log('Element inserted successfully:', data);
      setElements(prev => [...prev, data]);
      console.log('============================');
      return data;
    } catch (error: any) {
      console.error('=== Add Element Error ===');
      console.error('Error in addElement:', error);
      console.error('Error type:', typeof error);
      console.error('Error constructor:', error.constructor.name);
      console.error('========================');
      throw error;
    }
  };

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
      onDragEnter={handleDragEnter}
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
