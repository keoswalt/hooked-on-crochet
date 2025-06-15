
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { CanvasElements } from "./canvasTypes";
import type { Json } from "@/integrations/supabase/types";

type Status = "idle" | "saving" | "saved" | "error";

interface UseAutoSaveOptions {
  planId: string;
  elements: CanvasElements;
  debounceMs?: number;
  onSaved?: (success: boolean) => void;
}

export function useAutoSave({ planId, elements, debounceMs = 1200, onSaved }: UseAutoSaveOptions) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const timer = useRef<NodeJS.Timeout | null>(null);
  const lastSavedData = useRef<string>(""); // Serialize for fast comparison

  useEffect(() => {
    // Serialize current
    const currentData = JSON.stringify(elements);

    // Only save if data changed
    if (lastSavedData.current === currentData) return;

    setStatus("saving");
    setError(null);

    // Debounce save
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      try {
        const { error } = await supabase
          .from("plans")
          .update({ canvas_data: elements as unknown as Json }) // Fix: double cast for Supabase type
          .eq("id", planId);

        if (error) {
          setStatus("error");
          setError(error.message || "Failed to save");
          onSaved?.(false);
        } else {
          setStatus("saved");
          setError(null);
          lastSavedData.current = currentData;
          onSaved?.(true);
        }
      } catch (err: any) {
        setStatus("error");
        setError(err?.message || "Failed to save");
        onSaved?.(false);
      }
    }, debounceMs);

    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(elements), planId]);

  // Reset status to idle after 2.5s of "saved"
  useEffect(() => {
    if (status === "saved") {
      const to = setTimeout(() => setStatus("idle"), 2500);
      return () => clearTimeout(to);
    }
  }, [status]);

  return { status, error };
}

