
import { Card, CardContent } from '@/components/ui/card';
import { ModeToggle } from './ModeToggle';
import { RowTypeSelector } from '../rows/RowTypeSelector';
import { useState, useEffect, useRef } from 'react';

interface ModeHeaderProps {
  mode: 'edit' | 'make';
  onModeChange: (mode: 'edit' | 'make') => void;
  onAddRow: () => void;
  onAddNote: () => void;
  onAddDivider: () => void;
}

export const ModeHeader = ({
  mode,
  onModeChange,
  onAddRow,
  onAddNote,
  onAddDivider,
}: ModeHeaderProps) => {
  const [isSticky, setIsSticky] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(0);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (headerRef.current) {
        const rect = headerRef.current.getBoundingClientRect();
        const shouldBeSticky = rect.top <= 0;
        setIsSticky(shouldBeSticky);
      }
    };

    const handleResize = () => {
      if (headerRef.current && !isSticky) {
        setHeaderHeight(headerRef.current.offsetHeight);
      }
    };

    // Set initial height
    if (headerRef.current) {
      setHeaderHeight(headerRef.current.offsetHeight);
    }

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, [isSticky]);

  const headerContent = (
    <Card className="border border-gray-200 rounded-lg shadow-sm">
      <CardContent className="py-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h2 className="text-xl font-semibold">
              {mode === 'edit' ? 'Edit Mode' : 'Make Mode'}
            </h2>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex justify-between items-center sm:justify-start sm:gap-4">
              <ModeToggle mode={mode} onModeChange={onModeChange} />
              {mode === 'edit' && (
                <RowTypeSelector
                  onAddRow={onAddRow}
                  onAddNote={onAddNote}
                  onAddDivider={onAddDivider}
                />
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <>
      {/* Placeholder to prevent layout shift when sticky */}
      {isSticky && <div style={{ height: headerHeight }} />}
      
      {/* Header - either normal or sticky */}
      <div
        ref={headerRef}
        className={isSticky ? 'fixed top-0 left-0 right-0 z-50' : ''}
      >
        {headerContent}
      </div>
    </>
  );
};
