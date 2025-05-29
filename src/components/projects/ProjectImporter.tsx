
import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';

interface ProjectImporterProps {
  onImport: (file: File) => void;
  loading?: boolean;
}

export const ProjectImporter = ({ onImport, loading }: ProjectImporterProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImport(file);
      // Reset the input so the same file can be selected again if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".crochet,.json"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />
      <Button onClick={handleClick} disabled={loading} variant="outline">
        <Upload className="h-4 w-4 mr-2" />
        Import Project
      </Button>
    </>
  );
};
