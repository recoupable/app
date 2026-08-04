import { useEffect, useState } from "react";
import useIsMobile from "./useIsMobile";

const usePWADownload = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const isMobile = useIsMobile();
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    const response = /Android/i.test(navigator.userAgent);
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      // `standalone` is a non-standard Safari/iOS flag, absent from lib.dom.
      (window.navigator as Navigator & { standalone?: boolean }).standalone;

    if (!isStandalone && response) {
      setShowModal(true);
      window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    }
    return () =>
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
  }, [isMobile]);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      setDeferredPrompt(null);
      setShowModal(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    document.addEventListener("click", (e: any) => {
      if (e.target.id === "tap-close-download") {
        setShowModal(false);
      }
    });
  }, []);

  return {
    showModal,
    handleInstallClick,
  };
};

export default usePWADownload;
