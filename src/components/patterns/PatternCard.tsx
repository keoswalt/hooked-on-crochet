import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Star, StarOff, Copy } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { PatternStatusChip } from './PatternStatusChip';
import type { Database } from '@/integrations/supabase/types';

type Pattern = Database['public']['Tables']['patterns']['Row'];

interface PatternCardProps {
  pattern: Pattern;
  onEdit: (pattern: Pattern) => void;
  onDelete: (patternId: string) => void;
  onDuplicate: (pattern: Pattern) => Promise<void>;
  onToggleFavorite: (patternId: string, isFavorite: boolean) => Promise<void>;
  onCardClick: (pattern: Pattern) => void;
  userId: string;
}

export const PatternCard = ({ 
  pattern, 
  onEdit, 
  onDelete, 
  onDuplicate, 
  onToggleFavorite, 
  onCardClick, 
  userId 
}: PatternCardProps) => {
  const [isFavorite, setIsFavorite] = useState(pattern.is_favorite);
  const navigate = useNavigate();

  const handleCardClick = () => {
    onCardClick(pattern);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(pattern);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(pattern.id);
  };

  const handleDuplicateClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await onDuplicate(pattern);
  };

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await onToggleFavorite(pattern.id, pattern.is_favorite);
  };

  return (
    <Card className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300 ease-in-out" onClick={handleCardClick}>
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{pattern.name}</h2>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={handleEditClick}>Edit</DropdownMenuItem>
              <DropdownMenuItem onClick={handleDuplicateClick}>
                <Copy className="mr-2 h-4 w-4" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleDeleteClick}>Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center justify-between mb-3">
          <PatternStatusChip status={pattern.status} />
          <Button
            variant="ghost"
            size="icon"
            onClick={handleToggleFavorite}
          >
            {pattern.is_favorite ? (
              <Star className="h-4 w-4 text-yellow-500" />
            ) : (
              <StarOff className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            )}
            <span className="sr-only">Toggle Favorite</span>
          </Button>
        </div>

        <p className="text-gray-700 dark:text-gray-300">Hook: {pattern.hook_size}, Yarn: {pattern.yarn_weight}</p>
      </CardContent>
    </Card>
  );
};
