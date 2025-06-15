
import { PlannerPlanCard } from './PlannerPlanCard';
import { Card, CardContent } from '@/components/ui/card';
import { Palette, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Input } from '@/components/ui/input';
import type { Plan } from '@/pages/PlannerPage';

interface PlansGridProps {
  plans: Plan[];
  loading: boolean;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onClearSearch: () => void;
  onPlanClick: (planId: string) => void;
  onPlanDelete: (plan: Plan) => void;
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  totalPlans: number;
  PLANS_PER_PAGE: number;
}

export function PlansGrid({
  plans,
  loading,
  searchQuery,
  onSearchChange,
  onClearSearch,
  onPlanClick,
  onPlanDelete,
  totalPages,
  currentPage,
  onPageChange,
  totalPlans,
  PLANS_PER_PAGE,
}: PlansGridProps) {
  return (
    <div>
      {/* Search Input */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search plans..."
          value={searchQuery}
          onChange={e => onSearchChange(e.target.value)}
          className="pl-10 pr-10"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearSearch}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Plans Grid */}
      {loading ? (
        <div className="text-center py-8">
          <p className="text-gray-600">Loading plans...</p>
        </div>
      ) : plans.length === 0 ? (
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
      ) : (
        <>
          {/* Plan cards row: Responsive stacked on mobile, horizontal on desktop */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {plans.map(plan => (
              <PlannerPlanCard
                key={plan.id}
                plan={plan}
                onClick={() => onPlanClick(plan.id)}
                onDelete={() => onPlanDelete(plan)}
              />
            ))}
          </div>
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col items-center gap-4">
              <p className="text-sm text-gray-600">
                Showing {((currentPage - 1) * PLANS_PER_PAGE) + 1}-{Math.min(currentPage * PLANS_PER_PAGE, totalPlans)} of {totalPlans} plans
              </p>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => onPageChange(currentPage - 1)}
                      className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => onPageChange(page)}
                        isActive={currentPage === page}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => onPageChange(currentPage + 1)}
                      className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </>
      )}
    </div>
  );
}
