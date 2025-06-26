import { strict as assert } from "assert";
import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";
import { JSDOM } from "jsdom";
import { axe } from "jest-axe";
import Modal from "./modal";

// Extend assert to include jest-axe matcher – we'll just manually evaluate length instead of matcher.
// Setup JSDOM.
const dom = new JSDOM(`<!doctype html><html><body><div id="root"></div></body></html>`, {
  url: "http://localhost",
});
(globalThis as any).window = dom.window;
(globalThis as any).document = dom.window.document;
(globalThis as any).navigator = dom.window.navigator;

const rootElement = document.getElementById("root")!;
const root = createRoot(rootElement);

// Render modal open with sample content.
flushSync(() => {
  root.render(
    <Modal isOpen={true} onClose={() => {}} title="Accessibility Test">
      <p id="desc">Hello world content for axe.</p>
    </Modal>
  );
});

// Run axe on the rendered document body.
const results = await axe(document.body, {
  // We run only core WCAG rules; no need to adjust.
});

assert.equal(
  results.violations.length,
  0,
  `Expected no accessibility violations, found:\n${results.violations
    .map((v: any) => `${v.id}: ${v.help}`)
    .join("\n")}`
);

console.log("modal.accessibility tests passed."); 