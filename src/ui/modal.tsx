import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { useScrollLock } from "@/hooks/useScrollLock";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

/**
 * Unified Modal component.
 *
 * Features
 * --------
 * • Desktop centered dialog or mobile sheet variant (`variant="center" | "sheet"`).
 * • Size variants (`sm | md | lg | full`) controlling max-width on centered dialog.
 * • Built-in backdrop, focus-trap stub, scroll-lock, and accessibility roles.
 * • Tailwind animations that respect `prefers-reduced-motion`.
 * • Themed via design-token utility classes (`bg-card`, `text-card-foreground`, `border`).
 * • Optional default action buttons (**Cancel** / **Save**) with overrides for text / callback.
 *
 * Props
 * -----
 * isOpen            – boolean – controls visibility.
 * onClose           – () => void – invoked when user requests close (backdrop click, Cancel button, etc.).
 * title             – ReactNode – optional header title.
 * variant           – "center" | "sheet" – layout style (default "center").
 * size              – "sm" | "md" | "lg" | "full" – width cap for center variant (default "lg").
 * showDefaultActions – boolean – render default Cancel / Save buttons.
 * onConfirm         – () => void – Confirm button handler.
 * confirmText       – string – Confirm button label (default "Save").
 * cancelText        – string – Cancel button label (default "Cancel").
 * isLoading         – boolean – show loading state on confirm button and disable actions.
 *
 * Usage
 * -----
 * <Modal isOpen={open} onClose={close} title="Edit Profile" variant="center" size="md" showDefaultActions>
 *   <Modal.Body> ...form fields... </Modal.Body>
 * </Modal>
 *
 * The component also exposes sub-components (`Modal.Header`, `.Body`, `.Footer`, `.Backdrop`, `.Container`) for advanced composition.
 */
export interface ModalProps {
  /** Controls whether the modal is shown. */
  isOpen: boolean;
  /** Callback invoked when the modal requests to be closed. */
  onClose: () => void;
  /** Optional title displayed at the top of the modal. */
  title?: React.ReactNode;
  /**
   * Layout variant.
   * "center" – traditional centered dialog (default).
   * "sheet"  – mobile sheet that slides up from the bottom and spans full width.
   */
  variant?: "center" | "sheet";
  /** Modal content. */
  children?: React.ReactNode;
  /** Width size variant for the centered dialog. */
  size?: "sm" | "md" | "lg" | "full";
  /** Render built-in Cancel / Confirm buttons in the footer. */
  showDefaultActions?: boolean;
  /**
   * Allow clicking on the backdrop to close the modal. Default: true.
   * Set to false for critical dialogs that require explicit action.
   */
  dismissOnBackdropClick?: boolean;
  /** Callback for the Confirm/Save button. */
  onConfirm?: () => void;
  /** Customise confirm button text. (Default "Save") */
  confirmText?: string;
  /** Customise cancel button text. (Default "Cancel") */
  cancelText?: string;
  /** Show loading state on confirm button and disable actions. */
  isLoading?: boolean;
}

/**
 * A minimal scaffold for a unified Modal component.
 *
 * NOTE: This is intentionally lightweight to satisfy sub-task 1.1.
 * Additional features (portal rendering, backdrop, focus-trap, etc.)
 * will be layered on in subsequent subtasks.
 */
const ModalBase: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  variant = "center",
  size = "lg",
  showDefaultActions = false,
  dismissOnBackdropClick = true,
  onConfirm,
  confirmText = "Save",
  cancelText = "Cancel",
  isLoading = false,
  children,
}) => {
  const [mounted, setMounted] = React.useState(false);
  // Local state to keep component mounted during exit animation
  const [shouldRender, setShouldRender] = React.useState(isOpen);

  /**
   * Keep reference to the element that was focused before the modal opened so
   * we can restore focus when it closes (accessibility requirement).
   */
  const previouslyFocusedRef = React.useRef<HTMLElement | null>(null);

  // Manage focus & body scroll when modal is open (placeholder implementations).
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  useFocusTrap(isOpen, containerRef);
  useScrollLock(isOpen);

  // Delay portal creation until after the component is mounted to avoid SSR issues.
  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
    }
  }, [isOpen]);

  // Capture the currently focused element when the modal opens, restore on close.
  React.useEffect(() => {
    if (isOpen) {
      previouslyFocusedRef.current = document.activeElement as HTMLElement | null;
    } else {
      // Using setTimeout ensures the focus is restored after any state updates.
      setTimeout(() => {
        previouslyFocusedRef.current?.focus?.();
      }, 0);
    }
    // We only need to run when `isOpen` toggles.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Close modal when ESC key is pressed.
  React.useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  // Generate stable IDs for ARIA linking.
  const headerId = React.useId();
  const descriptionId = React.useId();

  if (!shouldRender || !mounted || typeof document === "undefined") {
    return null;
  }

  let modalRoot = document.getElementById("modal-root");
  if (!modalRoot) {
    modalRoot = document.createElement("div");
    modalRoot.id = "modal-root";
    document.body.appendChild(modalRoot);
  }

  const sizeClass =
    variant === "center"
      ? {
          sm: "max-w-sm",
          md: "max-w-md",
          lg: "max-w-lg",
          full: "max-w-none",
        }[size]
      : ""; // Width handled automatically for sheet variant

  const wrapperClass = cn(
    "fixed inset-0 z-50 flex",
    variant === "center" && "items-center justify-center",
    variant === "sheet" && "items-end justify-center"
  );

  const entering = isOpen;
  const animationStyle: React.CSSProperties | undefined = entering
    ? undefined
    : { animationFillMode: "forwards" };

  const containerClass = cn(
    variant === "center" && "",
    variant === "sheet" && "w-full rounded-none rounded-t-md max-h-[90vh]",
    sizeClass,
    // Animations
    variant === "center" && (entering ? "animate-in fade-in-0 zoom-in-95" : "animate-out fade-out-0 zoom-out-95"),
    variant === "sheet" && (entering ? "animate-in slide-in-from-bottom" : "animate-out slide-out-to-bottom"),
    "motion-reduce:animate-none"
  );

  const handleAnimationEnd: React.AnimationEventHandler<HTMLDivElement> = (e) => {
    if (!entering && e.target === e.currentTarget) {
      // Animation finished, unmount
      setShouldRender(false);
    }
  };

  const modalMarkup = (
    <div className={wrapperClass}>
      {/* Backdrop */}
      <ModalBackdrop onClick={dismissOnBackdropClick ? onClose : undefined} />

      {/* Container & content */}
      <ModalContainer
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        {...(title ? { "aria-labelledby": headerId } : {})}
        aria-describedby={descriptionId}
        className={containerClass}
        style={animationStyle}
        onAnimationEnd={handleAnimationEnd}
      >
        {/* Title prop convenience – optional */}
        {title && (
          <ModalHeader id={headerId} data-testid="modal-title">
            {title}
          </ModalHeader>
        )}

        {/* Children rendered directly – expected to include Modal.* slots */}
        {children && <ModalBody id={descriptionId}>{children}</ModalBody>}

        {/* Default action buttons if requested */}
        {showDefaultActions && (
          <ModalFooter>
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              {cancelText}
            </Button>
            <Button
              onClick={() => {
                onConfirm?.();
              }}
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
              {confirmText}
            </Button>
          </ModalFooter>
        )}

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
      "fixed inset-0 z-50 bg-black/50 animate-in fade-in-0 motion-reduce:animate-none",
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
        "z-50 w-full max-w-lg rounded-md bg-card text-card-foreground p-6 shadow-lg border",
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
      className={cn("mt-6 flex space-x-2", className)}
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