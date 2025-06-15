
import { useState } from "react";
import { Type, Image as ImageIcon, Link, Pencil, Package, Palette } from "lucide-react";
import { ToolButton } from "./ToolButton";

const TOOLS = [
  { key: "text", label: "Text", icon: Type },
  { key: "image", label: "Image", icon: ImageIcon },
  { key: "link", label: "Link", icon: Link },
  { key: "pencil", label: "Pencil", icon: Pencil },
  { key: "yarn", label: "Yarn", icon: Package },
  { key: "swatch", label: "Swatch", icon: Palette },
] as const;

export type ToolType = typeof TOOLS[number]["key"];

export interface ToolsToolbarProps {
  selectedTool: ToolType;
  setSelectedTool: (tool: ToolType) => void;
}

export function ToolsToolbar({ selectedTool, setSelectedTool }: ToolsToolbarProps) {
  return (
    <div className="fixed bottom-0 left-0 w-full z-50 flex justify-center bg-white border-t border-gray-200 shadow-lg pb-safe px-4 py-2 animate-fade-in">
      <div className="flex gap-2">
        {TOOLS.map((tool) => {
          const Icon = tool.icon;
          return (
            <ToolButton
              key={tool.key}
              aria-label={tool.label}
              selected={selectedTool === tool.key}
              onClick={() => setSelectedTool(tool.key)}
            >
              <Icon className="w-6 h-6 mb-1" />
              <span className="text-xs">{tool.label}</span>
            </ToolButton>
          );
        })}
      </div>
    </div>
  );
}
