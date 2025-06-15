
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Upload } from 'lucide-react';

interface YarnImageUploadProps {
  imageUrl: string;
  onImageUrlChange: (url: string) => void;
  onFileChange: (file: File | null) => void;
  selectedFile: File | null;
}

export const YarnImageUpload = ({ 
  imageUrl, 
  onImageUrlChange, 
  onFileChange,
  selectedFile 
}: YarnImageUploadProps) => {
  const [imageOption, setImageOption] = useState<'url' | 'upload'>('url');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    onFileChange(file || null);
  };

  return (
    <div className="space-y-3">
      <Label>Yarn Image</Label>
      <RadioGroup value={imageOption} onValueChange={(value: 'url' | 'upload') => setImageOption(value)}>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="url" id="url" />
          <Label htmlFor="url">Image URL</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="upload" id="upload" />
          <Label htmlFor="upload">Upload Image</Label>
        </div>
      </RadioGroup>

      {imageOption === 'url' ? (
        <Input
          placeholder="Enter image URL"
          value={imageUrl}
          onChange={(e) => onImageUrlChange(e.target.value)}
        />
      ) : (
        <div className="relative">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="sr-only"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="inline-flex items-center justify-center gap-2 h-10 px-4 py-2 bg-white border border-input rounded-md text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer"
          >
            <Upload className="h-4 w-4" />
            {selectedFile ? selectedFile.name : 'Choose Image File'}
          </label>
        </div>
      )}
    </div>
  );
};
