
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Type, Square, Circle, Image as ImageIcon, Move, Trash2 } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type Plan = Database['public']['Tables']['plans']['Row'];

interface CanvasElement {
  id: string;
  type: 'text' | 'rectangle' | 'circle' | 'image';
  x: number;
  y: number;
  width: number;
  height: number;
  content?: string;
  color?: string;
  imageUrl?: string;
}

interface PlanCanvasProps {
  plan: Plan;
  onUpdatePlan: (updates: Partial<Plan>) => void;
}

export const PlanCanvas = ({ plan, onUpdatePlan }: PlanCanvasProps) => {
  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [tool, setTool] = useState<'select' | 'text' | 'rectangle' | 'circle' | 'image'>('select');
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);

  // Load canvas data from plan
  useEffect(() => {
    if (plan.canvas_data && typeof plan.canvas_data === 'object') {
      const canvasData = plan.canvas_data as any;
      if (canvasData.elements && Array.isArray(canvasData.elements)) {
        setElements(canvasData.elements);
      }
    }
  }, [plan.canvas_data]);

  // Save canvas data to plan
  const saveCanvasData = (newElements: CanvasElement[]) => {
    const canvasData = {
      elements: newElements,
      lastModified: new Date().toISOString(),
    };
    
    onUpdatePlan({
      canvas_data: canvasData as any,
    });
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (tool === 'select') return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newElement: CanvasElement = {
      id: `element-${Date.now()}`,
      type: tool as any,
      x,
      y,
      width: tool === 'text' ? 200 : 100,
      height: tool === 'text' ? 30 : 100,
      content: tool === 'text' ? 'Click to edit text' : undefined,
      color: '#3b82f6',
    };

    const newElements = [...elements, newElement];
    setElements(newElements);
    saveCanvasData(newElements);
    setSelectedElement(newElement.id);
  };

  const handleElementMouseDown = (e: React.MouseEvent, elementId: string) => {
    e.stopPropagation();
    setSelectedElement(elementId);
    
    if (tool === 'select') {
      setIsDragging(true);
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      
      const element = elements.find(el => el.id === elementId);
      if (!element) return;
      
      setDragOffset({
        x: e.clientX - rect.left - element.x,
        y: e.clientY - rect.top - element.y,
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !selectedElement) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const newX = e.clientX - rect.left - dragOffset.x;
    const newY = e.clientY - rect.top - dragOffset.y;

    const newElements = elements.map(el =>
      el.id === selectedElement
        ? { ...el, x: Math.max(0, newX), y: Math.max(0, newY) }
        : el
    );

    setElements(newElements);
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      saveCanvasData(elements);
    }
  };

  const deleteSelectedElement = () => {
    if (!selectedElement) return;
    
    const newElements = elements.filter(el => el.id !== selectedElement);
    setElements(newElements);
    saveCanvasData(newElements);
    setSelectedElement(null);
  };

  const updateElementContent = (content: string) => {
    if (!selectedElement) return;
    
    const newElements = elements.map(el =>
      el.id === selectedElement ? { ...el, content } : el
    );
    setElements(newElements);
    saveCanvasData(newElements);
  };

  const selectedElementData = elements.find(el => el.id === selectedElement);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <Card>
        <CardHeader>
          <CardTitle>Canvas Tools</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant={tool === 'select' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTool('select')}
            >
              <Move className="h-4 w-4 mr-1" />
              Select
            </Button>
            <Button
              variant={tool === 'text' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTool('text')}
            >
              <Type className="h-4 w-4 mr-1" />
              Text
            </Button>
            <Button
              variant={tool === 'rectangle' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTool('rectangle')}
            >
              <Square className="h-4 w-4 mr-1" />
              Rectangle
            </Button>
            <Button
              variant={tool === 'circle' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTool('circle')}
            >
              <Circle className="h-4 w-4 mr-1" />
              Circle
            </Button>
            {selectedElement && (
              <Button
                variant="destructive"
                size="sm"
                onClick={deleteSelectedElement}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Properties Panel */}
      {selectedElementData && (
        <Card>
          <CardHeader>
            <CardTitle>Element Properties</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {selectedElementData.type === 'text' && (
              <div>
                <label className="block text-sm font-medium mb-1">Text Content</label>
                <Input
                  value={selectedElementData.content || ''}
                  onChange={(e) => updateElementContent(e.target.value)}
                  placeholder="Enter text content"
                />
              </div>
            )}
            <div className="text-xs text-gray-500">
              Position: ({Math.round(selectedElementData.x)}, {Math.round(selectedElementData.y)})
            </div>
          </CardContent>
        </Card>
      )}

      {/* Canvas */}
      <Card>
        <CardHeader>
          <CardTitle>Design Canvas</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            ref={canvasRef}
            className="relative w-full h-96 bg-gray-50 border-2 border-dashed border-gray-300 cursor-crosshair overflow-hidden"
            onClick={handleCanvasClick}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={() => setIsDragging(false)}
          >
            {elements.map((element) => (
              <div
                key={element.id}
                className={`absolute cursor-pointer border-2 ${
                  selectedElement === element.id
                    ? 'border-blue-500 border-solid'
                    : 'border-transparent'
                }`}
                style={{
                  left: element.x,
                  top: element.y,
                  width: element.width,
                  height: element.height,
                }}
                onMouseDown={(e) => handleElementMouseDown(e, element.id)}
              >
                {element.type === 'text' && (
                  <div
                    className="w-full h-full flex items-center justify-center bg-white text-sm font-medium p-2"
                    style={{ color: element.color }}
                  >
                    {element.content || 'Text'}
                  </div>
                )}
                {element.type === 'rectangle' && (
                  <div
                    className="w-full h-full border"
                    style={{ backgroundColor: element.color, opacity: 0.7 }}
                  />
                )}
                {element.type === 'circle' && (
                  <div
                    className="w-full h-full rounded-full border"
                    style={{ backgroundColor: element.color, opacity: 0.7 }}
                  />
                )}
              </div>
            ))}
            
            {elements.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <Plus className="h-12 w-12 mx-auto mb-2" />
                  <p>Click to add elements to your canvas</p>
                  <p className="text-sm">Use the tools above to get started</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
