
import * as React from "react";
import { cn } from "@/lib/utils";

interface ToolButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
  "aria-label": string;
  children: React.ReactNode;
}

export const ToolButton = React.forwardRef<HTMLButtonElement, ToolButtonProps>(
  ({ selected, className, children, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "flex flex-col items-center justify-center px-3 py-2 rounded-md hover:bg-accent transition-colors focus:outline-none focus:ring-2 focus:ring-primary group",
        selected && "bg-accent text-primary ring-2 ring-primary",
        className
      )}
      {...props}
    >
      {children}
    </button>
  ),
);
ToolButton.displayName = "ToolButton";
