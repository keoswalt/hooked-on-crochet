
import { useState } from "react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { ImageViewer } from "@/components/images/ImageViewer";
import { Loader2, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from "react-beautiful-dnd";

interface PlanImage {
  id: string;
  image_url: string;
  is_featured?: boolean;
  uploaded_at?: string;
  position?: number;
}
interface PlanImagesGridProps {
  images: PlanImage[];
  loading: boolean;
  onDeleteImage: (imageId: string) => void;
  onReorder?: (sourceIdx: number, destIdx: number) => void;
  reordering?: boolean;
}
export const PlanImagesGrid = ({
  images,
  loading,
  onDeleteImage,
  onReorder,
  reordering = false,
}: PlanImagesGridProps) => {
  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="animate-spin h-6 w-6 text-gray-400" />
      </div>
    );
  }
  if (!images.length) {
    return (
      <div className="text-muted-foreground py-6">
        No images added yet.
      </div>
    );
  }

  // DND: Handler when drag ends
  const handleDragEnd = (result: DropResult) => {
    if (
      !result.destination ||
      result.destination.index === result.source.index
    )
      return;
    if (onReorder)
      onReorder(result.source.index, result.destination.index);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable
        droppableId="plan-images-grid"
        direction="horizontal"
        renderClone={(provided, snapshot, rubric) => {
          const img = images[rubric.source.index];
          return (
            <div
              ref={provided.innerRef}
              {...provided.draggableProps}
              {...provided.dragHandleProps}
              className="relative w-full bg-gray-50 rounded-md overflow-hidden opacity-70"
              style={{ ...provided.draggableProps.style, minWidth: 0 }}
            >
              <AspectRatio ratio={1} className="w-full">
                <ImageViewer
                  imageUrl={img.image_url}
                  alt="Plan Image"
                  className="w-full h-full"
                  onDelete={() => onDeleteImage(img.id)}
                />
              </AspectRatio>
            </div>
          );
        }}
      >
        {(provided) => (
          <div
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
            ref={provided.innerRef}
            {...provided.droppableProps}
          >
            {images.map((img, idx) => (
              <Draggable
                draggableId={img.id}
                index={idx}
                key={img.id}
                isDragDisabled={!!reordering}
              >
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className={`relative w-full bg-gray-50 rounded-md overflow-hidden outline-none ${
                      snapshot.isDragging ? "opacity-60 ring-2 ring-primary" : ""
                    }`}
                  >
                    <div
                      className="absolute z-10 left-2 top-2 cursor-grab"
                      {...provided.dragHandleProps}
                    >
                      <GripVertical className="w-5 h-5 text-gray-400 opacity-80" />
                    </div>
                    <AspectRatio ratio={1} className="w-full">
                      <ImageViewer
                        imageUrl={img.image_url}
                        alt="Plan Image"
                        className="w-full h-full"
                        onDelete={() => onDeleteImage(img.id)}
                      />
                    </AspectRatio>
                    {/* Featured badge logic is now based on position, 
                        but you requested NOT to show it here, so omitted */}
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};
export default PlanImagesGrid;
