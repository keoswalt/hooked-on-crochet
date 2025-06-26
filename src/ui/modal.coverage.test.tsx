import { strict as assert } from "assert";
import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";
import { JSDOM } from "jsdom";
import Modal from "./modal";

// Setup JSDOM environment.
const dom = new JSDOM(`<!doctype html><html><body><div id="root"></div></body></html>`, {
  url: "http://localhost",
});
(globalThis as any).window = dom.window;
(globalThis as any).document = dom.window.document;
(globalThis as any).navigator = dom.window.navigator;

const rootElement = document.getElementById("root")!;
const root = createRoot(rootElement);

const tick = () => new Promise((r) => setTimeout(r, 0));

/* -------------------------------------------------------------------------
 * Default action buttons behaviour
 * ---------------------------------------------------------------------- */
let confirmClicked = false;
flushSync(() => {
  root.render(
    <Modal
      isOpen={true}
      onClose={() => {}}
      title="Actions"
      showDefaultActions
      onConfirm={() => {
        confirmClicked = true;
      }}
    >
      Body
    </Modal>
  );
});

// Find buttons.
const buttonsAll = Array.from(document.querySelectorAll("button"));
const cancelBtn = buttonsAll.find((b) => b.textContent === "Cancel") as HTMLButtonElement | undefined;
const saveBtn = buttonsAll.find((b) => b.textContent === "Save") as HTMLButtonElement | undefined;
assert.ok(cancelBtn && saveBtn, "Default Cancel and Save buttons should render");

// Click save.
saveBtn.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
await tick();
assert.ok(confirmClicked, "onConfirm should fire when Save button clicked");

/* -------------------------------------------------------------------------
 * Loading state disables buttons
 * ---------------------------------------------------------------------- */
flushSync(() => {
  root.render(
    <Modal
      isOpen={true}
      onClose={() => {}}
      title="Loading"
      showDefaultActions
      isLoading
    />
  );
});

const buttons = Array.from(document.querySelectorAll("button"));
assert.ok(buttons.every((b) => b.disabled), "All action buttons should be disabled when isLoading");

/* -------------------------------------------------------------------------
 * Scroll lock behaviour
 * ---------------------------------------------------------------------- */
flushSync(() => {
  root.render(<Modal isOpen={true} onClose={() => {}} title="ScrollLock" />);
});
assert.equal(document.body.style.overflow, "hidden", "Body overflow should be hidden while modal open");

// Close the modal.
flushSync(() => {
  root.render(<Modal isOpen={false} onClose={() => {}} title="ScrollLock" />);
});
// Simulate animation end to unmount.
const dlg = document.querySelector('[role="dialog"]');
if (dlg) dlg.dispatchEvent(new window.Event("animationend", { bubbles: true }));
await tick();
assert.equal(document.body.style.overflow, "", "Body overflow should restore after modal closes");

console.log("modal.coverage tests passed."); 