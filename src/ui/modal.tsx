import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { useScrollLock } from "@/hooks/useScrollLock";

export interface ModalProps {
  /** Controls whether the modal is shown. */
  isOpen: boolean;
  /** Callback invoked when the modal requests to be closed. */
  onClose: () => void;
  /** Optional title displayed at the top of the modal. */
  title?: React.ReactNode;
  /** Modal content. */
  children?: React.ReactNode;
}

/**
 * A minimal scaffold for a unified Modal component.
 *
 * NOTE: This is intentionally lightweight to satisfy sub-task 1.1.
 * Additional features (portal rendering, backdrop, focus-trap, etc.)
 * will be layered on in subsequent subtasks.
 */
const ModalBase: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  const [mounted, setMounted] = React.useState(false);

  // Manage focus & body scroll when modal is open (placeholder implementations).
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  useFocusTrap(isOpen, containerRef);
  useScrollLock(isOpen);

  // Delay portal creation until after the component is mounted to avoid SSR issues.
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted || typeof document === "undefined") {
    return null;
  }

  let modalRoot = document.getElementById("modal-root");
  if (!modalRoot) {
    modalRoot = document.createElement("div");
    modalRoot.id = "modal-root";
    document.body.appendChild(modalRoot);
  }

  const modalMarkup = (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <ModalBackdrop onClick={onClose} />

      {/* Container & content */}
      <ModalContainer ref={containerRef} role="dialog" aria-modal="true">
        {/* Title prop convenience – optional */}
        {title && <ModalHeader data-testid="modal-title">{title}</ModalHeader>}

        {/* Children rendered directly – expected to include Modal.* slots */}
        {children && <ModalBody>{children}</ModalBody>}

        {/* Close button (temp, will live in header later) */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          ×
        </button>
      </ModalContainer>
    </div>
  );

  return createPortal(modalMarkup, modalRoot);
};

ModalBase.displayName = "Modal";

// Sub-components ----------------------------------------------------------------------------------------------------

/** Semi-transparent backdrop behind the modal container. */
const ModalBackdrop: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div
    className={cn(
      "fixed inset-0 z-50 bg-black/50 transition-opacity data-[state=open]:animate-in data-[state=closed]:animate-out",
      className
    )}
    {...props}
  />
);

/** The wrapper that contains modal content. */
const ModalContainer = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "z-50 w-full max-w-lg rounded-md bg-background p-6 shadow-lg",
        "relative flex flex-col",
        className
      )}
      {...props}
    />
  )
);
ModalContainer.displayName = "ModalContainer";

/** Header slot – typically contains title text. */
const ModalHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <header ref={ref} className={cn("mb-4 text-lg font-semibold", className)} {...props} />
  )
);
ModalHeader.displayName = "ModalHeader";

/** Body slot – primary scrollable content area. */
const ModalBody = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex-1 overflow-y-auto", className)} {...props} />
  )
);
ModalBody.displayName = "ModalBody";

/** Footer slot – actions (e.g., buttons) belong here. */
const ModalFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <footer
      ref={ref}
      className={cn("mt-6 flex flex-row-reverse space-x-2 space-x-reverse", className)}
      {...props}
    />
  )
);
ModalFooter.displayName = "ModalFooter";

// Merge sub-components onto the main component for ergonomic namespacing.
export const Modal = Object.assign(ModalBase, {
  Backdrop: ModalBackdrop,
  Container: ModalContainer,
  Header: ModalHeader,
  Body: ModalBody,
  Footer: ModalFooter,
});

export type ModalComponent = typeof Modal;

export default Modal; 