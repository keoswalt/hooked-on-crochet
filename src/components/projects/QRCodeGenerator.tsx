import { useState, useEffect } from 'react';
import { QrCode, Download, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import QRCode from 'qrcode';
import type { Database } from '@/integrations/supabase/types';

type Project = Database['public']['Tables']['projects']['Row'];

interface QRCodeGeneratorProps {
  project: Project;
}

export const QRCodeGenerator = ({ project }: QRCodeGeneratorProps) => {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const projectUrl = `${window.location.origin}/projects/${project.id}`;

  useEffect(() => {
    if (isOpen && !qrCodeDataUrl) {
      generateQRCode();
    }
  }, [isOpen]);

  const generateQRCode = async () => {
    try {
      const dataUrl = await QRCode.toDataURL(projectUrl, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      setQrCodeDataUrl(dataUrl);
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast({
        title: "Error",
        description: "Failed to generate QR code",
        variant: "destructive",
      });
    }
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(projectUrl);
      toast({
        title: "URL copied",
        description: "Project URL has been copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy URL to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleDownloadQR = () => {
    if (!qrCodeDataUrl) return;

    const link = document.createElement('a');
    link.download = `${project.name}-qr-code.png`;
    link.href = qrCodeDataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "QR code downloaded",
      description: "QR code has been saved to your downloads",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <QrCode className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Project</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="font-medium mb-2">{project.name}</h3>
            {qrCodeDataUrl ? (
              <div className="flex justify-center mb-4">
                <img 
                  src={qrCodeDataUrl} 
                  alt="QR Code for project" 
                  className="border rounded-lg"
                />
              </div>
            ) : (
              <div className="flex justify-center items-center h-64 bg-gray-100 rounded-lg mb-4">
                <span className="text-gray-500">Generating QR code...</span>
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Project URL:</label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={projectUrl}
                readOnly
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md bg-gray-50"
              />
              <Button variant="outline" size="sm" onClick={handleCopyUrl}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex justify-center space-x-2">
            <Button variant="outline" onClick={handleDownloadQR} disabled={!qrCodeDataUrl}>
              <Download className="h-4 w-4 mr-2" />
              Download QR
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
