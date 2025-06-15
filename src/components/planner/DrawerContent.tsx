
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Type, Image, Link, Package, Palette } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { HorizontalScrollContainer } from './HorizontalScrollContainer';
import type { Database } from '@/integrations/supabase/types';

type YarnStash = Database['public']['Tables']['yarn_stash']['Row'];
type Swatch = Database['public']['Tables']['swatches']['Row'];

interface DrawerContentProps {
  userId: string;
  planId: string;
}

export const DrawerContent = ({ userId, planId }: DrawerContentProps) => {
  const [yarnStash, setYarnStash] = useState<YarnStash[]>([]);
  const [swatches, setSwatches] = useState<Swatch[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchYarnStash();
    fetchSwatches();
  }, [userId]);

  const fetchYarnStash = async () => {
    try {
      const { data, error } = await supabase
        .from('yarn_stash')
        .select('*')
        .eq('user_id', userId)
        .order('name');

      if (error) throw error;
      setYarnStash(data || []);
    } catch (error: any) {
      console.error('Error fetching yarn stash:', error);
    }
  };

  const fetchSwatches = async () => {
    try {
      const { data, error } = await supabase
        .from('swatches')
        .select('*')
        .eq('user_id', userId)
        .order('title');

      if (error) throw error;
      setSwatches(data || []);
    } catch (error: any) {
      console.error('Error fetching swatches:', error);
    }
  };

  const handleDragStart = (e: React.DragEvent, type: string, data: any) => {
    e.dataTransfer.setData('application/json', JSON.stringify({
      type,
      data,
    }));
    e.dataTransfer.effectAllowed = 'copy';
  };

  const filteredYarn = yarnStash.filter(yarn =>
    yarn.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (yarn.brand && yarn.brand.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredSwatches = swatches.filter(swatch =>
    swatch.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col">
      {/* Search Bar */}
      <div className="p-4 border-b border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search elements, yarn, or swatches..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="elements" className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-3 mx-4 mt-2">
          <TabsTrigger value="elements">Elements</TabsTrigger>
          <TabsTrigger value="yarn">Yarn ({filteredYarn.length})</TabsTrigger>
          <TabsTrigger value="swatches">Swatches ({filteredSwatches.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="elements" className="flex-1 p-4">
          <div className="mb-3">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Basic Elements</h4>
            <HorizontalScrollContainer>
              <div className="flex space-x-3">
                <Card
                  className="min-w-[140px] cursor-move hover:shadow-md transition-shadow"
                  draggable
                  onDragStart={(e) => handleDragStart(e, 'text', { content: 'New Text' })}
                >
                  <CardContent className="p-3 text-center">
                    <Type className="h-6 w-6 mx-auto mb-2 text-gray-600" />
                    <p className="text-xs font-medium">Text Box</p>
                  </CardContent>
                </Card>

                <Card
                  className="min-w-[140px] cursor-move hover:shadow-md transition-shadow"
                  draggable
                  onDragStart={(e) => handleDragStart(e, 'image', { url: '' })}
                >
                  <CardContent className="p-3 text-center">
                    <Image className="h-6 w-6 mx-auto mb-2 text-gray-600" />
                    <p className="text-xs font-medium">Image</p>
                  </CardContent>
                </Card>

                <Card
                  className="min-w-[140px] cursor-move hover:shadow-md transition-shadow"
                  draggable
                  onDragStart={(e) => handleDragStart(e, 'link', { url: '', title: 'New Link' })}
                >
                  <CardContent className="p-3 text-center">
                    <Link className="h-6 w-6 mx-auto mb-2 text-gray-600" />
                    <p className="text-xs font-medium">Link</p>
                  </CardContent>
                </Card>
              </div>
            </HorizontalScrollContainer>
          </div>
        </TabsContent>

        <TabsContent value="yarn" className="flex-1 p-4">
          {filteredYarn.length === 0 ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-center">
                <Package className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">No yarn found</p>
              </div>
            </div>
          ) : (
            <HorizontalScrollContainer>
              <div className="flex space-x-3">
                {filteredYarn.map((yarn) => (
                  <Card
                    key={yarn.id}
                    className="min-w-[160px] cursor-move hover:shadow-md transition-shadow"
                    draggable
                    onDragStart={(e) => handleDragStart(e, 'yarn', yarn)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center space-x-2 mb-2">
                        {yarn.image_url && (
                          <img
                            src={yarn.image_url}
                            alt={yarn.name}
                            className="w-8 h-8 rounded object-cover flex-shrink-0"
                          />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium truncate">{yarn.name}</p>
                          <p className="text-xs text-gray-600 truncate">
                            {yarn.brand} - {yarn.color}
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500">
                        {yarn.remaining_yardage || yarn.yardage} yds
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </HorizontalScrollContainer>
          )}
        </TabsContent>

        <TabsContent value="swatches" className="flex-1 p-4">
          {filteredSwatches.length === 0 ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-center">
                <Palette className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">No swatches found</p>
              </div>
            </div>
          ) : (
            <HorizontalScrollContainer>
              <div className="flex space-x-3">
                {filteredSwatches.map((swatch) => (
                  <Card
                    key={swatch.id}
                    className="min-w-[160px] cursor-move hover:shadow-md transition-shadow"
                    draggable
                    onDragStart={(e) => handleDragStart(e, 'swatch', swatch)}
                  >
                    <CardContent className="p-3">
                      <p className="text-xs font-medium mb-1 line-clamp-2">{swatch.title}</p>
                      {swatch.description && (
                        <p className="text-xs text-gray-600 mb-2 line-clamp-2">{swatch.description}</p>
                      )}
                      {swatch.hook_size && (
                        <p className="text-xs text-gray-500">Hook: {swatch.hook_size}</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </HorizontalScrollContainer>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
