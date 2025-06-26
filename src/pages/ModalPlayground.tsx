import { Button } from "@/components/ui/button";
import { Modal } from "@/ui/modal";
import * as React from "react";

export const ModalPlayground: React.FC = () => {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="flex h-screen items-center justify-center">
      <Button onClick={() => setOpen(true)}>Open Modal</Button>

      <Modal isOpen={open} onClose={() => setOpen(false)} title="Modal Playground">
        <p className="mb-4">This is a simple playground for the unified Modal component.</p>
        <Modal.Footer>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={() => alert("Confirmed!")}>Confirm</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ModalPlayground; 