import { ExternalLink, Trash2, Edit } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ResourceDeleteConfirmDialog from "./ResourceDeleteConfirmDialog";
import React, { useState } from "react";

interface PlanResourceCardProps {
  title: string;
  url: string;
  onDelete?: () => void;
  onEdit?: () => void;
}

function extractDomain(url: string): string {
  // Ensure protocol exists for URL parsing
  let parsedUrlString = url.trim();
  if (!/^https?:\/\//.test(parsedUrlString)) {
    parsedUrlString = "https://" + parsedUrlString.replace(/^\/\//, "");
  }
  try {
    // @ts-ignore
    const parsed = new URL(parsedUrlString);
    let hostname = parsed.hostname;
    // Remove www.
    if (hostname.startsWith("www.")) hostname = hostname.replace("www.", "");
    return hostname;
  } catch (e) {
    // Fallback: extract first part or show as-is
    const match = parsedUrlString.match(/^(?:https?:\/\/)?(?:www\.)?([^\/?#]+)/i);
    return match?.[1] || url;
  }
}

export default function PlanResourceCard({
  title,
  url,
  onDelete,
  onEdit,
}: PlanResourceCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Handler to open the resource link in a new tab
  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent link opening when clicking a button or within the icon row
    const target = e.target as HTMLElement;
    if (
      target.closest('button') ||
      target.closest('a[data-icon="launch"]') ||
      target.closest('a[data-icon="edit"]') ||
      target.closest('a[data-icon="delete"]')
    ) {
      return;
    }
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const domain = extractDomain(url);

  return (
    <Card
      className="flex flex-col justify-between px-4 py-3 gap-2 cursor-pointer group"
      onClick={handleCardClick}
      tabIndex={0}
      role="link"
      aria-label={`${title} (${url})`}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          handleCardClick(e as any);
        }
      }}
    >
      <div className="flex-1 min-w-0 truncate font-medium">{title}</div>
      <div className="flex flex-row items-center justify-between pt-2">
        {/* URL prefix chip (left) */}
        <Badge
          variant="outline"
          className="text-xs px-2 py-0.5 select-none"
          tabIndex={-1}
        >
          {domain}
        </Badge>
        {/* Icon buttons (right) */}
        <div className="flex flex-row items-center gap-1">
          {/* Launch button */}
          <Button
            asChild
            size="icon"
            variant="ghost"
            aria-label="Open resource link"
            className="transition-colors"
          >
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              title={url}
              tabIndex={-1}
              data-icon="launch"
              onClick={e => e.stopPropagation()} // Prevent click bubbling to Card
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </Button>
          {/* Edit button */}
          {onEdit && (
            <Button
              size="icon"
              variant="ghost"
              aria-label="Edit resource"
              onClick={e => {
                e.stopPropagation();
                onEdit();
              }}
            >
              <Edit className="w-4 h-4" />
            </Button>
          )}
          {/* Delete button */}
          {onDelete && (
            <>
              <Button
                size="icon"
                variant="ghost"
                aria-label="Delete resource"
                onClick={e => {
                  e.stopPropagation();
                  setShowDeleteDialog(true);
                }}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
              <ResourceDeleteConfirmDialog
                open={showDeleteDialog}
                onOpenChange={setShowDeleteDialog}
                onConfirm={() => {
                  setShowDeleteDialog(false);
                  if (onDelete) onDelete();
                }}
              />
            </>
          )}
        </div>
      </div>
    </Card>
  );
}
