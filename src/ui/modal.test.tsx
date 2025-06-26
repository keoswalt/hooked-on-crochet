import { strict as assert } from "assert";
import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";
import { JSDOM } from "jsdom";

// Ensure a DOM-like environment using JSDOM so React can attach portals.
const dom = new JSDOM(`<!doctype html><html><body><div id="root"></div></body></html>`, {
  url: "http://localhost",
});

// Expose DOM globals that React expects.
(globalThis as any).window = dom.window;
(globalThis as any).document = dom.window.document;
(globalThis as any).navigator = dom.window.navigator;

// The component under test.
import Modal from "./modal";

// Helper noop onClose handler.
const onClose = () => {
  /* no-op for these tests */
};

// Mount point for React.
const rootElement = document.getElementById("root")!;

// React 18 root.
const root = createRoot(rootElement);

// 1. Modal should not render when `isOpen` is false.
flushSync(() => {
  root.render(
    <Modal isOpen={false} onClose={onClose} title="Test Modal">
      Content
    </Modal>
  );
});
assert.strictEqual(
  document.querySelector('[role="dialog"]'),
  null,
  "Modal should NOT be present in the DOM when isOpen=false"
);

// 2. Modal should appear when `isOpen` becomes true.
flushSync(() => {
  root.render(
    <Modal isOpen={true} onClose={onClose} title="Test Modal">
      Content
    </Modal>
  );
});
const dialog = document.querySelector('[role="dialog"]');
assert.ok(dialog, "Modal should be present in the DOM when isOpen=true");

// 3. Modal should unmount after `isOpen` toggles back to false **and** exit animation completes.
flushSync(() => {
  root.render(
    <Modal isOpen={false} onClose={onClose} title="Test Modal">
      Content
    </Modal>
  );
});

// The modal stays mounted until its exit animation fires the `animationend` event.
// Manually dispatch that event to simulate the animation finishing.
if (dialog) {
  const animationEndEvt = new window.Event("animationend", { bubbles: true });
  dialog.dispatchEvent(animationEndEvt);
}

// Wait for the micro-task queue to flush React state updates.
await new Promise((resolve) => setTimeout(resolve, 0));

assert.strictEqual(
  document.querySelector('[role="dialog"]'),
  null,
  "Modal should be removed from the DOM once closed and animation ends"
);

console.log("modal.openClose prop change tests passed."); 