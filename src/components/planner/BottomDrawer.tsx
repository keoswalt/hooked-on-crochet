
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { DrawerContent } from './DrawerContent';

interface BottomDrawerProps {
  userId: string;
  planId: string;
}

export const BottomDrawer = ({ userId, planId }: BottomDrawerProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white border-t border-gray-200 shadow-lg w-full">
      {/* Drawer Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <h3 className="text-sm font-medium text-gray-700">Tools & Elements</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="h-8 w-8 p-0"
        >
          {isExpanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronUp className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Drawer Content */}
      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isExpanded ? 'h-80' : 'h-0'
        }`}
      >
        <DrawerContent userId={userId} planId={planId} />
      </div>
    </div>
  );
};
