import { strict as assert } from "assert";
import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";
import { JSDOM } from "jsdom";
import Modal from "./modal";

// Establish DOM environment for snapshot tests.
const dom = new JSDOM(`<!doctype html><html><body><div id="root"></div></body></html>`, {
  url: "http://localhost",
});
(globalThis as any).window = dom.window;
(globalThis as any).document = dom.window.document;
(globalThis as any).navigator = dom.window.navigator;

const rootElement = document.getElementById("root")!;
const root = createRoot(rootElement);

// Helper to render and return the dialog element.
function renderModal(props: Partial<Parameters<typeof Modal>[0]> = {}) {
  flushSync(() => {
    root.render(
      <Modal isOpen={true} onClose={() => {}} title="Snapshot" {...props} />
    );
  });
  return document.querySelector('[role="dialog"]') as HTMLElement;
}

/* -------------------------------------------------------------------------
 * Center variant – size "md" should include max-w-md class
 * ---------------------------------------------------------------------- */
const centerDialog = renderModal({ variant: "center", size: "md" });
assert.ok(centerDialog, "Modal should render in center variant");
assert.ok(
  centerDialog.className.includes("max-w-md"),
  "Center variant with size=md should include 'max-w-md' class"
);

/* -------------------------------------------------------------------------
 * Sheet variant – should be full width and have mobile sheet classes
 * ---------------------------------------------------------------------- */
const sheetDialog = renderModal({ variant: "sheet" });
assert.ok(sheetDialog, "Modal should render in sheet variant");
assert.ok(
  sheetDialog.className.includes("w-full"),
  "Sheet variant should include 'w-full' class"
);
assert.ok(
  sheetDialog.className.includes("rounded-t-md"),
  "Sheet variant should include 'rounded-t-md' class"
);
assert.ok(
  sheetDialog.className.includes("max-h-[90vh]"),
  "Sheet variant should include max height constraint class"
);

console.log("modal.snapshot tests passed."); 