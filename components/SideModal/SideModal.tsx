import useModalAnimation from "@/hooks/useModalAnimation";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { type ReactNode, type MouseEvent, type KeyboardEvent } from "react";

const SideModal = ({
  containerClasses = "",
  className = "",
  direction = "right",
  isVisible,
  toggleModal,
  children,
}: {
  containerClasses?: string;
  className?: string;
  direction?: string;
  isVisible: boolean;
  toggleModal: () => void;
  children: ReactNode;
}) => {
  const { animate, initial } = useModalAnimation(isVisible, direction);

  const handleClose = () => {
    toggleModal();
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      handleClose();
    }
  };

  return (
    <>
      {/* Dim overlay */}
      <div
        className={`fixed inset-0 z-[199] bg-black/60 transition-opacity duration-200 ${
          isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={handleClose}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
        aria-label="Close modal"
      />

      {/* Modal */}
      <div
        className={cn(
          "fixed top-0 z-[200] h-screen w-screen overflow-hidden",
          direction === "left" ? "left-0" : "right-0",
          isVisible ? "flex" : "hidden",
          containerClasses,
        )}
        onClick={(e: MouseEvent<HTMLDivElement>) => {
          if (e.target === e.currentTarget) handleClose();
        }}
        onKeyDown={handleKeyDown}
        role="dialog"
        aria-modal="true"
      >
        <motion.div
          className={cn(
            "flex h-full w-full flex-col bg-card max-w-[300px] px-4 py-4 md:py-8",
            direction === "left" ? "mr-auto" : "ml-auto",
            className,
          )}
          animate={animate}
          initial={initial}
          transition={{ duration: 0.2 }}
        >
          {children}
        </motion.div>
      </div>
    </>
  );
};

export default SideModal;
