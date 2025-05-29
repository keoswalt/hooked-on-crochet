
import { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Edit, 
  Trash2, 
  Copy, 
  Lock, 
  Unlock, 
  Plus, 
  Minus, 
  Image as ImageIcon,
  RotateCcw
} from 'lucide-react';
import { ImageUploader } from '@/components/images/ImageUploader';
import { ImageViewer } from '@/components/images/ImageViewer';
import { LinkRenderer } from '@/components/ui/link-renderer';
import type { Database } from '@/integrations/supabase/types';

type ProjectRow = Database['public']['Tables']['project_rows']['Row'];

interface RowCardProps {
  row: ProjectRow;
  mode: 'edit' | 'make';
  userId: string;
  onUpdateCounter: (id: string, counter: number) => void;
  onUpdateInstructions: (id: string, instructions: string) => void;
  onUpdateLabel: (id: string, label: string) => void;
  onUpdateTotalStitches: (id: string, totalStitches: number) => void;
  onUpdateMakeModeCounter: (id: string, counter: number) => void;
  onUpdateMakeModeStatus: (id: string, status: string) => void;
  onToggleLock: (id: string, isLocked: boolean) => void;
  onDuplicate: (row: ProjectRow) => void;
  onDelete: (id: string) => void;
  onUpdateRowImage: (id: string, imageUrl: string | null) => void;
}

export const RowCard = ({
  row,
  mode,
  userId,
  onUpdateCounter,
  onUpdateInstructions,
  onUpdateLabel,
  onUpdateTotalStitches,
  onUpdateMakeModeCounter,
  onUpdateMakeModeStatus,
  onToggleLock,
  onDuplicate,
  onDelete,
  onUpdateRowImage,
}: RowCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(row.instructions);
  const [editLabel, setEditLabel] = useState(row.label || '');
  const [editTotalStitches, setEditTotalStitches] = useState(row.total_stitches);
  const [showImageUploader, setShowImageUploader] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleSave = () => {
    onUpdateInstructions(row.id, editValue);
    onUpdateLabel(row.id, editLabel);
    onUpdateTotalStitches(row.id, editTotalStitches);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(row.instructions);
    setEditLabel(row.label || '');
    setEditTotalStitches(row.total_stitches);
    setIsEditing(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const handleCounterChange = (newCounter: number) => {
    if (newCounter >= 1) {
      onUpdateCounter(row.id, newCounter);
    }
  };

  const handleMakeModeCounterChange = (change: number) => {
    const newCounter = Math.max(0, row.make_mode_counter + change);
    onUpdateMakeModeCounter(row.id, newCounter);
    
    if (newCounter === 0) {
      onUpdateMakeModeStatus(row.id, 'not_started');
    } else if (newCounter >= row.total_stitches && row.total_stitches > 0) {
      onUpdateMakeModeStatus(row.id, 'completed');
    } else {
      onUpdateMakeModeStatus(row.id, 'in_progress');
    }
  };

  const handleResetMakeModeCounter = () => {
    onUpdateMakeModeCounter(row.id, 0);
    onUpdateMakeModeStatus(row.id, 'not_started');
  };

  const handleImageUpload = (imageUrl: string) => {
    onUpdateRowImage(row.id, imageUrl);
    setShowImageUploader(false);
  };

  const handleImageDelete = () => {
    onUpdateRowImage(row.id, null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in_progress': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'in_progress': return 'In Progress';
      default: return 'Not Started';
    }
  };

  if (row.type === 'divider') {
    return (
      <div className="flex items-center justify-center py-4">
        <div className="flex-1 border-t border-gray-300"></div>
        <span className="px-4 text-gray-500 text-sm font-medium">• • •</span>
        <div className="flex-1 border-t border-gray-300"></div>
        {mode === 'edit' && (
          <div className="ml-4 flex space-x-1">
            <Button variant="outline" size="sm" onClick={() => onDuplicate(row)}>
              <Copy className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => onDelete(row.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    );
  }

  if (row.type === 'note') {
    return (
      <Card className="bg-yellow-50 border-yellow-200">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="text-sm font-medium text-yellow-800 mb-1">Note</div>
              {isEditing ? (
                <textarea
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyDown={handleKeyPress}
                  onBlur={handleSave}
                  className="w-full p-2 border rounded text-sm resize-none min-h-[60px]"
                  autoFocus
                />
              ) : (
                <div className="text-sm text-yellow-700">
                  <LinkRenderer text={row.instructions} />
                </div>
              )}
            </div>
            {mode === 'edit' && (
              <div className="ml-4 flex space-x-1">
                <Button variant="outline" size="sm" onClick={() => setIsEditing(!isEditing)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => onDuplicate(row)}>
                  <Copy className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => onDelete(row.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`transition-all duration-200 ${row.is_locked ? 'bg-gray-50' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            {mode === 'edit' ? (
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">Row</span>
                <Input
                  type="number"
                  value={row.counter}
                  onChange={(e) => handleCounterChange(parseInt(e.target.value) || 1)}
                  className="w-16 h-8 text-center"
                  min="1"
                />
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">Row {row.counter}</span>
                <Badge variant="secondary" className={`${getStatusColor(row.make_mode_status)} text-white`}>
                  {getStatusText(row.make_mode_status)}
                </Badge>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-1">
            {mode === 'make' && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResetMakeModeCounter}
                  disabled={row.make_mode_counter === 0}
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleMakeModeCounterChange(-1)}
                  disabled={row.make_mode_counter === 0}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium px-2">
                  {row.make_mode_counter} / {row.total_stitches}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleMakeModeCounterChange(1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </>
            )}
            
            {mode === 'edit' && (
              <>
                <Button variant="outline" size="sm" onClick={() => setShowImageUploader(!showImageUploader)}>
                  <ImageIcon className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => setIsEditing(!isEditing)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => onToggleLock(row.id, !row.is_locked)}>
                  {row.is_locked ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                </Button>
                <Button variant="outline" size="sm" onClick={() => onDuplicate(row)}>
                  <Copy className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => onDelete(row.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>

        {row.image_url && (
          <div className="mb-3">
            <ImageViewer
              imageUrl={row.image_url}
              alt={`Row ${row.counter} image`}
              className="max-w-xs"
              onDelete={mode === 'edit' ? handleImageDelete : undefined}
            />
          </div>
        )}

        {showImageUploader && mode === 'edit' && (
          <div className="mb-3">
            <ImageUploader
              onImageUploaded={handleImageUpload}
              userId={userId}
              folder="rows"
              className="w-full"
            />
          </div>
        )}

        {isEditing ? (
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium">Label (optional)</label>
              <Input
                value={editLabel}
                onChange={(e) => setEditLabel(e.target.value)}
                placeholder="e.g., Decrease round"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Instructions</label>
              <textarea
                ref={inputRef}
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={handleKeyPress}
                className="w-full mt-1 p-2 border rounded text-sm resize-none min-h-[80px]"
                placeholder="Enter row instructions..."
              />
            </div>
            <div>
              <label className="text-sm font-medium">Total Stitches</label>
              <Input
                type="number"
                value={editTotalStitches}
                onChange={(e) => setEditTotalStitches(parseInt(e.target.value) || 0)}
                className="mt-1 w-24"
                min="0"
              />
            </div>
            <div className="flex space-x-2">
              <Button onClick={handleSave} size="sm">Save</Button>
              <Button onClick={handleCancel} variant="outline" size="sm">Cancel</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {row.label && (
              <div className="text-sm font-medium text-blue-600">{row.label}</div>
            )}
            <div className="text-sm">
              <LinkRenderer text={row.instructions} />
            </div>
            {row.total_stitches > 0 && (
              <div className="text-xs text-gray-500">
                Total stitches: {row.total_stitches}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
