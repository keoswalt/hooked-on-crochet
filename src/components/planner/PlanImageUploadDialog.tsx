
import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRef, useState } from "react";
import { ImageUploader, ImageUploaderRef } from "@/components/images/ImageUploader";
import { useToast } from "@/hooks/use-toast";

interface PlanImageUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  planId: string;
  onImageAdded: (imageUrl: string) => void;
}
export const PlanImageUploadDialog = ({
  open,
  onOpenChange,
  userId,
  planId,
  onImageAdded
}: PlanImageUploadDialogProps) => {
  const [activeTab, setActiveTab] = useState("upload");
  const [urlValue, setUrlValue] = useState("");
  const [addingUrl, setAddingUrl] = useState(false);
  const { toast } = useToast();
  const imageUploaderRef = useRef<ImageUploaderRef>(null);

  const handleUrlAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingUrl(true);
    // Basic URL validation
    try {
      new URL(urlValue);
      onImageAdded(urlValue);
      setUrlValue("");
      toast({ title: "Image added", description: "Image URL added successfully." });
      onOpenChange(false);
    } catch {
      toast({
        title: "Invalid URL",
        description: "Please provide a valid image URL.",
        variant: "destructive"
      });
    }
    setAddingUrl(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Image</DialogTitle>
        </DialogHeader>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="upload">Upload from Device</TabsTrigger>
            <TabsTrigger value="url">Add from URL</TabsTrigger>
          </TabsList>
          <TabsContent value="upload">
            <ImageUploader
              ref={imageUploaderRef}
              userId={userId}
              folder={`plans/${planId}`}
              accept="image/*"
              onImageUploaded={(imageUrl) => {
                onImageAdded(imageUrl);
                toast({ title: "Image uploaded", description: "Your image was uploaded." });
                onOpenChange(false);
              }}
              showButton={true}
              uniqueId={planId}
              className="pb-1"
            />
          </TabsContent>
          <TabsContent value="url">
            <form onSubmit={handleUrlAdd} className="space-y-4">
              <Input
                type="url"
                placeholder="Paste image URL here"
                required
                autoFocus
                value={urlValue}
                onChange={(e) => setUrlValue(e.target.value)}
                disabled={addingUrl}
              />
              <div className="flex gap-2 justify-end">
                <Button type="submit" disabled={addingUrl || !urlValue}>Add Image</Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
export default PlanImageUploadDialog;
