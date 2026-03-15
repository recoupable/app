import { useEffect } from "react";
import type { RefObject } from "react";

type Props = {
  menuRef: RefObject<HTMLElement>;
  buttonRefs: RefObject<Record<string, HTMLElement | null>>;
  isOpen: boolean;
  onClose: () => void;
};

export const useOutsideClick = ({ menuRef, buttonRefs, isOpen, onClose }: Props) => {
  useEffect(() => {
    // Only add listener if the menu is open
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      // Don't close if clicking on the menu itself
      if (menuRef.current?.contains(event.target as Node)) {
        return;
      }

      // Don't close if clicking on the button that opens the menu
      const clickedOnMenuButton = Object.values(buttonRefs.current || {}).some(buttonRef =>
        buttonRef?.contains(event.target as Node),
      );

      if (!clickedOnMenuButton) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuRef, buttonRefs, isOpen, onClose]);
};
