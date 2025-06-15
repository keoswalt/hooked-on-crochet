
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Palette } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Database } from '@/integrations/supabase/types';

type Plan = Database['public']['Tables']['plans']['Row'];

interface PlansGridProps {
  plans: Plan[];
  loading: boolean;
  searchQuery: string;
  onClearSearch: () => void;
}

export const PlansGrid = ({ plans, loading, searchQuery, onClearSearch }: PlansGridProps) => {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Loading plans...</p>
      </div>
    );
  }

  if (plans.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Palette className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          {searchQuery ? (
            <div>
              <p className="text-gray-600 mb-2">No plans found matching "{searchQuery}"</p>
              <Button variant="outline" onClick={onClearSearch}>
                Clear search
              </Button>
            </div>
          ) : (
            <p className="text-gray-600">No plans yet. Create your first one!</p>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
      {plans.map((plan) => (
        <Card key={plan.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(`/planner/${plan.id}`)}>
          <CardHeader>
            <CardTitle>{plan.name}</CardTitle>
            {plan.description && (
              <CardDescription>{plan.description}</CardDescription>
            )}
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">
              Last modified: {new Date(plan.updated_at).toLocaleDateString()}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
