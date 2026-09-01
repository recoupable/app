"use client";

import { useEffect } from "react";
import Modal from "./Modal";
import { useUserProvider } from "@/providers/UserProvder";
import Account from "./Account";

const AccountModal = () => {
  const { isModalOpen, toggleModal } = useUserProvider();

  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isModalOpen) {
        toggleModal();
      }
    };

      // Added event listener when modal is open
    if (isModalOpen) {
      window.addEventListener("keydown", handleEscKey);
      
      // Preventing background scrolling when modal is open
      document.body.style.overflow = "hidden";
    }

    // Cleanup
    return () => {
      window.removeEventListener("keydown", handleEscKey);
      document.body.style.overflow = "unset";
    };
  }, [isModalOpen, toggleModal]);

  return (
    <>
      {isModalOpen && (
        <Modal onClose={toggleModal}>
          <Account />
        </Modal>
      )}
    </>
  );
};

export default AccountModal;
