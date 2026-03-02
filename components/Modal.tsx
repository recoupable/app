"use client";

import { X } from "lucide-react";
import { useEffect, useRef, useCallback, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { containerPatterns, buttonPatterns, iconPatterns } from "@/lib/styles/patterns";
import { cn } from "@/lib/utils";

interface IModal {
  onClose: () => void;
  children: ReactNode;
  className?: string;
  containerClasses?: string;
}

// Focusable element selector for focus trapping
const FOCUSABLE_SELECTOR = 
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

const Modal = ({ children, onClose, className, containerClasses }: IModal) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<Element | null>(null);
  const onCloseRef = useRef(onClose);
  // Track whether mousedown started on the overlay itself.
  // Prevents "split clicks" where mousedown is inside the modal but a DOM reflow
  // (e.g., tab content change) causes mouseup to land on the overlay, generating
  // a click event on the overlay that would incorrectly close the modal.
  const overlayMouseDownRef = useRef(false);

  // Keep onClose ref updated without triggering effect re-runs
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  // Handle Escape key and focus trapping (stable reference via ref)
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") {
      onCloseRef.current();
      return;
    }

    // Focus trap: cycle through focusable elements
    if (e.key === "Tab" && modalRef.current) {
      const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement?.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement?.focus();
      }
    }
  }, []); // Empty deps - uses ref for onClose

  useEffect(() => {
    // SSR guard
    if (typeof document === "undefined") return;

    // Save previously focused element to restore on close
    previousActiveElement.current = document.activeElement;

    // Prevent body scroll while modal is open
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Add keyboard listener
    document.addEventListener("keydown", handleKeyDown);

    // Focus first focusable element in modal (only on mount)
    const focusableElements = modalRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
    focusableElements?.[0]?.focus();

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      
      // Restore focus to previously focused element
      if (previousActiveElement.current instanceof HTMLElement) {
        previousActiveElement.current.focus();
      }
    };
  }, [handleKeyDown]); // handleKeyDown is now stable (empty deps)

  // SSR guard: portals require document to exist
  if (typeof document === "undefined") return null;

  const modalContent = (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
    <div
      className={cn(containerPatterns.modalOverlay, "px-3 md:px-0", className)}
      onMouseDown={(e) => {
        overlayMouseDownRef.current = e.target === e.currentTarget;
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && overlayMouseDownRef.current) {
          onClose();
        }
        overlayMouseDownRef.current = false;
      }}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        className={cn(
          containerPatterns.modal,
          "relative z-[1001] max-h-[95%] md:max-h-[85%] overflow-y-auto w-full md:w-[500px] px-4 py-3 md:p-4",
          containerClasses
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className={cn(buttonPatterns.icon, "absolute right-3 md:right-2 top-2 z-[1002]")}
          aria-label="Close"
        >
          <X className={cn("size-5 md:size-6", iconPatterns.primary)} />
        </button>
        {children}
      </div>
    </div>
  );

  // Render at document root to avoid z-index/clipping issues from parent containers
  return createPortal(modalContent, document.body);
};

export default Modal;
