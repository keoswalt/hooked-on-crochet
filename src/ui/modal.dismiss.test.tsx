import { strict as assert } from "assert";
import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";
import { JSDOM } from "jsdom";
import Modal from "./modal";

// Bootstrap JSDOM environment with a root mount point.
const dom = new JSDOM(`<!doctype html><html><body><div id="root"></div></body></html>`, {
  url: "http://localhost",
});
(globalThis as any).window = dom.window;
(globalThis as any).document = dom.window.document;
(globalThis as any).navigator = dom.window.navigator;

const rootElement = document.getElementById("root")!;
const root = createRoot(rootElement);

// Utility to wait for micro-tasks.
const tick = () => new Promise((r) => setTimeout(r, 0));

/* -------------------------------------------------------------------------
 * 1. ESC key dismissal
 * ---------------------------------------------------------------------- */
let escClosed = false;
flushSync(() => {
  root.render(
    <Modal isOpen={true} onClose={() => { escClosed = true; }} title="ESC Test" />
  );
});
// Ensure dialog is present.
assert.ok(document.querySelector('[role="dialog"]'), "Modal should render for ESC test");

// Dispatch ESC keydown.
const escEvent = new window.KeyboardEvent("keydown", { key: "Escape", bubbles: true });
window.document.dispatchEvent(escEvent);
await tick();
assert.ok(escClosed, "onClose should be called when ESC key pressed");

/* -------------------------------------------------------------------------
 * 2. Backdrop click dismissal (enabled)
 * ---------------------------------------------------------------------- */
let backdropClosed = false;
flushSync(() => {
  root.render(
    <Modal isOpen={true} onClose={() => { backdropClosed = true; }} title="Backdrop" />
  );
});
// Backdrop element has bg-black/50 class – select via attribute contains selector.
const backdrop = document.querySelector('div[class*="bg-black/50"]') as HTMLElement;
assert.ok(backdrop, "Backdrop element should exist");
backdrop.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
await tick();
assert.ok(backdropClosed, "onClose should be called when backdrop clicked");

/* -------------------------------------------------------------------------
 * 3. Backdrop click when disabled (dismissOnBackdropClick=false)
 * ---------------------------------------------------------------------- */
let backdropPrevented = false;
flushSync(() => {
  root.render(
    <Modal
      isOpen={true}
      onClose={() => { backdropPrevented = true; }}
      title="Backdrop Disabled"
      dismissOnBackdropClick={false}
    />
  );
});
const backdrop2 = document.querySelector('div[class*="bg-black/50"]') as HTMLElement;
backdrop2.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
await tick();
assert.strictEqual(backdropPrevented, false, "onClose should NOT fire when dismissOnBackdropClick=false");

console.log("modal.dismiss tests passed."); 