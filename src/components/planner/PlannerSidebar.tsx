
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Plus, Package, Palette, Type, Image, Link } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type YarnStash = Database['public']['Tables']['yarn_stash']['Row'];
type Swatch = Database['public']['Tables']['swatches']['Row'];

interface PlannerSidebarProps {
  userId: string;
  projectId: string;
}

export const PlannerSidebar = ({ userId, projectId }: PlannerSidebarProps) => {
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
  };

  const filteredYarn = yarnStash.filter(yarn =>
    yarn.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (yarn.brand && yarn.brand.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredSwatches = swatches.filter(swatch =>
    swatch.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold mb-3">Tools & Elements</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <Tabs defaultValue="elements" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mx-4 mt-4">
            <TabsTrigger value="elements">Elements</TabsTrigger>
            <TabsTrigger value="yarn">Yarn</TabsTrigger>
            <TabsTrigger value="swatches">Swatches</TabsTrigger>
          </TabsList>

          <TabsContent value="elements" className="p-4 space-y-3">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Basic Elements</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  draggable
                  onDragStart={(e) => handleDragStart(e, 'text', { content: 'New Text' })}
                >
                  <Type className="h-4 w-4 mr-2" />
                  Text Box
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  draggable
                  onDragStart={(e) => handleDragStart(e, 'image', { url: '' })}
                >
                  <Image className="h-4 w-4 mr-2" />
                  Image
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  draggable
                  onDragStart={(e) => handleDragStart(e, 'link', { url: '', title: 'New Link' })}
                >
                  <Link className="h-4 w-4 mr-2" />
                  Link
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="yarn" className="p-4 space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium">Yarn Stash</h3>
              <Button size="sm" variant="outline">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            {filteredYarn.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <Package className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">No yarn found</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {filteredYarn.map((yarn) => (
                  <Card
                    key={yarn.id}
                    className="cursor-move hover:shadow-md transition-shadow"
                    draggable
                    onDragStart={(e) => handleDragStart(e, 'yarn', yarn)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center space-x-3">
                        {yarn.image_url && (
                          <img
                            src={yarn.image_url}
                            alt={yarn.name}
                            className="w-8 h-8 rounded object-cover"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{yarn.name}</p>
                          <p className="text-xs text-gray-600 truncate">
                            {yarn.brand} - {yarn.color}
                          </p>
                          <p className="text-xs text-gray-500">
                            {yarn.remaining_yardage || yarn.yardage} yds
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="swatches" className="p-4 space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium">Swatches</h3>
              <Button size="sm" variant="outline">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {filteredSwatches.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <Palette className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">No swatches found</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {filteredSwatches.map((swatch) => (
                  <Card
                    key={swatch.id}
                    className="cursor-move hover:shadow-md transition-shadow"
                    draggable
                    onDragStart={(e) => handleDragStart(e, 'swatch', swatch)}
                  >
                    <CardContent className="p-3">
                      <p className="text-sm font-medium">{swatch.title}</p>
                      {swatch.description && (
                        <p className="text-xs text-gray-600 line-clamp-2">{swatch.description}</p>
                      )}
                      {swatch.hook_size && (
                        <p className="text-xs text-gray-500 mt-1">Hook: {swatch.hook_size}</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </ScrollArea>
    </div>
  );
};
