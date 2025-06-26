import { Button } from "@/components/ui/button";
import { Modal } from "@/ui/modal";
import * as React from "react";

export const ModalPlayground: React.FC = () => {
  const [open, setOpen] = React.useState(false);
  const [variant, setVariant] = React.useState<"center" | "sheet">("center");
  const [size, setSize] = React.useState<"sm" | "md" | "lg" | "full">("lg");

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="space-x-2 mb-4">
        <Button onClick={() => { setVariant("center"); setOpen(true); }}>
          Open Center Modal
        </Button>
        <Button onClick={() => { setVariant("sheet"); setOpen(true); }}>
          Open Sheet Modal
        </Button>
      </div>

      <div className="space-x-2 mb-4">
        {(["sm", "md", "lg", "full"] as const).map(s => (
          <Button key={s} variant={size === s ? undefined : "outline"} onClick={() => setSize(s)}>
            {s.toUpperCase()}
          </Button>
        ))}
      </div>

      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        title="Modal Playground"
        variant={variant}
        size={size}
        showDefaultActions
        onConfirm={() => alert("Confirmed!")}
        confirmText="Confirm"
      >
        <p className="mb-4">This is a simple playground for the unified Modal component.</p>
      </Modal>
    </div>
  );
};

export default ModalPlayground; 