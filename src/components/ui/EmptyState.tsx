
import React from "react";

interface EmptyStateProps {
  children: React.ReactNode;
}

const EmptyState = ({ children }: EmptyStateProps) => (
  <div className="border rounded-md py-6 px-4 flex items-center justify-center text-muted-foreground min-h-[64px] bg-gray-50">
    {children}
  </div>
);

export default EmptyState;
