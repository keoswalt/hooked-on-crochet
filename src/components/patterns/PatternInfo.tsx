
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PatternStatusChip } from './PatternStatusChip';
import { TagDisplay } from '@/components/tags/TagDisplay';
import { LinkifiedText } from '@/components/ui/linkified-text';
import type { Database } from '@/integrations/supabase/types';

type Pattern = Database['public']['Tables']['patterns']['Row'];

interface PatternInfoProps {
  pattern: Pattern;
  userId: string;
}

export const PatternInfo = ({ pattern, userId }: PatternInfoProps) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Featured Image */}
          {pattern.featured_image_url && (
            <div className="lg:col-span-1">
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={pattern.featured_image_url}
                  alt={pattern.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}

          {/* Pattern Details */}
          <div className={pattern.featured_image_url ? 'lg:col-span-2' : 'lg:col-span-3'}>
            <div className="space-y-4">
              {/* Basic Info */}
              <div className="flex flex-wrap gap-3">
                <Badge variant="outline">
                  Hook: {pattern.hook_size}
                </Badge>
                <Badge variant="outline">
                  Yarn Weight: {pattern.yarn_weight}
                </Badge>
                {pattern.is_favorite && (
                  <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                    ❤️ Favorite
                  </Badge>
                )}
              </div>

              {/* Status */}
              <PatternStatusChip status={pattern.status} />

              {/* Tags */}
              <div>
                <TagDisplay
                  entityId={pattern.id}
                  entityType="pattern"
                  userId={userId}
                  readonly={true}
                />
              </div>

              {/* Details */}
              {pattern.details && (
                <div>
                  <h3 className="font-semibold mb-2">Details</h3>
                  <div className="text-gray-700 whitespace-pre-wrap">
                    <LinkifiedText text={pattern.details} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
