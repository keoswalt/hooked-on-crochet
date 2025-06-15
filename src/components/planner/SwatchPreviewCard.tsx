
import { CardTitle } from "@/components/ui/card";
import type { Database } from "@/integrations/supabase/types";
import { useSwatchImages } from "@/hooks/useSwatchImages";

type Swatch = Database["public"]["Tables"]["swatches"]["Row"];

interface SwatchPreviewCardProps {
  swatch: Swatch;
  checked: boolean;
  onSelect: () => void;
  children?: React.ReactNode;
}

export default function SwatchPreviewCard({ swatch, checked, onSelect, children }: SwatchPreviewCardProps) {
  const { images } = useSwatchImages(swatch.id);

  return (
    <div
      className={`relative rounded-lg border transition-shadow shadow hover:shadow-md cursor-pointer ${checked ? "ring-2 ring-primary border-primary" : "ring-0 border-gray-200 bg-white"}`}
      tabIndex={0}
      onClick={onSelect}
      aria-checked={checked}
      role="checkbox"
    >
      {/* Image section */}
      <div className="w-full h-36 overflow-hidden rounded-t-lg bg-gray-100 flex items-center justify-center">
        {images.length > 0 ? (
          <img
            src={images[0]}
            alt={swatch.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
            draggable={false}
          />
        ) : (
          <div className="text-gray-400 text-sm">No image</div>
        )}
      </div>

      {children && (
        <div className="pointer-events-auto">{children}</div>
      )}

      <div className="pt-4 pb-2 px-2">
        <CardTitle className="text-base font-semibold mb-1">
          {swatch.title}
        </CardTitle>
        <div className="text-xs text-gray-700 mb-2">{swatch.hook_size && <>Hook: {swatch.hook_size}</>}</div>
        {swatch.yarn_used && (
          <div className="text-xs text-gray-700 mb-1">
            Yarn: {swatch.yarn_used}
          </div>
        )}
        {(swatch.stitches_per_inch || swatch.rows_per_inch) && (
          <div className="text-xs text-gray-700">
            Gauge:{" "}
            {swatch.stitches_per_inch && `${swatch.stitches_per_inch} st/in`}
            {swatch.rows_per_inch && `, ${swatch.rows_per_inch} rows/in`}
          </div>
        )}
        {swatch.description && (
          <div className="text-xs text-gray-500 mt-1 line-clamp-2">{swatch.description}</div>
        )}
      </div>
    </div>
  );
}
