
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';

interface PatternImporterProps {
  onImport: (file: File) => void;
  loading: boolean;
}

export const PatternImporter = ({ onImport, loading }: PatternImporterProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImport(file);
      // Clear the input so the same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".crochet"
        onChange={handleFileSelect}
        className="hidden"
      />
      <Button
        variant="outline"
        onClick={handleImportClick}
        disabled={loading}
        className="whitespace-nowrap"
      >
        <Upload className="h-4 w-4 mr-2" />
        Import Pattern
      </Button>
    </>
  );
};
