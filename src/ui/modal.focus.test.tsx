import { strict as assert } from "assert";
import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";
import { JSDOM } from "jsdom";
import userEvent from "@testing-library/user-event";

// Establish a JSDOM environment with a root mount point and an external trigger button.
const dom = new JSDOM(
  `<!doctype html><html><body><button id="trigger">Trigger</button><div id="root"></div></body></html>`,
  {
    url: "http://localhost",
  }
);

(globalThis as any).window = dom.window;
(globalThis as any).document = dom.window.document;
(globalThis as any).navigator = dom.window.navigator;

import Modal from "./modal";

const trigger = document.getElementById("trigger") as HTMLButtonElement;
trigger.focus(); // Seed initial focus on trigger before opening modal.

const rootElement = document.getElementById("root")!;
const root = createRoot(rootElement);

// Create a user-event instance bound to the current window.
const user = userEvent.setup({ document: dom.window.document });

flushSync(() => {
  root.render(
    <Modal isOpen={true} onClose={() => {}} title="Focus Trap Test">
      <button id="first" style={{ position: "fixed" }}>
        First
      </button>
      <button id="second" style={{ position: "fixed" }}>
        Second
      </button>
    </Modal>
  );
});

// After mount, the first focusable element inside the modal should have focus.
const firstButton = document.getElementById("first") as HTMLButtonElement;
await new Promise((r) => setTimeout(r, 0)); // allow any focus timers to fire.
assert.strictEqual(
  document.activeElement,
  firstButton,
  "Focus should move inside modal to the first focusable element"
);

// TAB key should cycle focus to the second button and then the close button, then back to first.
await user.tab();
const secondButton = document.getElementById("second") as HTMLButtonElement;
assert.strictEqual(
  document.activeElement,
  secondButton,
  "Focus should advance to second element with Tab"
);

await user.tab(); // to close button (×) – we only assert it's still inside dialog
const dialog = document.querySelector('[role="dialog"]') as HTMLElement;
assert.ok(
  dialog.contains(document.activeElement),
  "Focus should remain within modal after second Tab"
);

await user.tab(); // should loop back to first
assert.strictEqual(
  document.activeElement,
  firstButton,
  "Focus should loop back to first element after cycling"
);

// Close the modal.
flushSync(() => {
  root.render(
    <Modal isOpen={false} onClose={() => {}} title="Focus Trap Test">
      <button id="first" style={{ position: "fixed" }}>First</button>
      <button id="second" style={{ position: "fixed" }}>Second</button>
    </Modal>
  );
});

// Simulate end of exit animation to allow unmounting.
const animationEndEvt = new window.Event("animationend", { bubbles: true });
if (dialog) dialog.dispatchEvent(animationEndEvt);

await new Promise((r) => setTimeout(r, 0));

assert.strictEqual(
  document.activeElement,
  trigger,
  "Focus should return to the trigger element once modal closes"
);

console.log("modal.focus trap & restoration tests passed."); 