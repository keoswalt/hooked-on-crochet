
import type { User } from '@supabase/supabase-js';

interface PlannerDetailPageProps {
  user: User;
}

export const PlannerDetailPage = ({ user }: PlannerDetailPageProps) => {
  // Blank shell for future detail page content
  return (
    <div className="min-h-screen flex items-center justify-center">
      <h1 className="text-2xl font-semibold">Plan Detail</h1>
    </div>
  );
};
