import { AspectRatio } from "@/components/ui/aspect-ratio";
import { ImageViewer } from "@/components/images/ImageViewer";
import { Loader2, GripVertical, Star } from "lucide-react";
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
  onToggleFeatured?: (imageId: string) => void;
}
export const PlanImagesGrid = ({
  images,
  loading,
  onDeleteImage,
  onReorder,
  reordering = false,
  onToggleFeatured,
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
              {onToggleFeatured && (
                <button
                  type="button"
                  title={
                    img.is_featured
                      ? "Featured image"
                      : "Set as featured image"
                  }
                  className={`absolute z-20 right-2 top-2 p-1 rounded-full transition-colors ${
                    img.is_featured
                      ? "text-yellow-500"
                      : "text-gray-300 hover:text-yellow-500"
                  }`}
                  style={{background: "none", boxShadow: "none"}} // Remove background
                  onClick={e => {
                    e.stopPropagation();
                    onToggleFeatured(img.id);
                  }}
                >
                  <Star
                    fill={img.is_featured ? "currentColor" : "none"}
                    strokeWidth={2}
                    className="w-6 h-6"
                  />
                </button>
              )}
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
                    {onToggleFeatured && (
                      <button
                        type="button"
                        title={
                          img.is_featured
                            ? "Featured image"
                            : "Set as featured image"
                        }
                        className={`absolute z-20 right-2 top-2 p-1 rounded-full transition-colors ${
                          img.is_featured
                            ? "text-yellow-500"
                            : "text-gray-300 hover:text-yellow-500"
                        }`}
                        style={{background: "none", boxShadow: "none"}} // Remove background
                        onClick={e => {
                          e.stopPropagation();
                          onToggleFeatured(img.id);
                        }}
                      >
                        <Star
                          fill={img.is_featured ? "currentColor" : "none"}
                          strokeWidth={2}
                          className="w-6 h-6"
                        />
                      </button>
                    )}
                    <AspectRatio ratio={1} className="w-full">
                      <ImageViewer
                        imageUrl={img.image_url}
                        alt="Plan Image"
                        className="w-full h-full"
                        onDelete={() => onDeleteImage(img.id)}
                      />
                    </AspectRatio>
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
