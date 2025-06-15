
import React from "react";

interface CanvasSaveStatusProps {
  status: "idle" | "saving" | "saved" | "error";
  error: string | null;
}
export const CanvasSaveStatus: React.FC<CanvasSaveStatusProps> = ({ status, error }) => (
  <div
    className="absolute bottom-3 left-1/2 -translate-x-1/2 z-40 px-3 py-1 rounded text-sm font-medium flex gap-1 items-center
      bg-white/90 shadow border"
    style={{ minWidth: 100, pointerEvents: "none" }}
    aria-live="polite"
  >
    {status === "saving" && (
      <>
        <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse mr-1"></span>
        <span className="text-gray-800">Saving...</span>
      </>
    )}
    {status === "saved" && (
      <>
        <span className="w-2 h-2 rounded-full bg-green-500 inline-block mr-1"></span>
        <span className="text-green-700">Saved</span>
      </>
    )}
    {status === "error" && (
      <>
        <span className="w-2 h-2 rounded-full bg-red-500 inline-block mr-1"></span>
        <span className="text-red-700">{error || "Error"}</span>
      </>
    )}
    {status === "idle" && (
      <>
        <span className="w-2 h-2 rounded-full bg-gray-400 inline-block mr-1"></span>
        <span className="text-gray-500">Up to date</span>
      </>
    )}
  </div>
);
