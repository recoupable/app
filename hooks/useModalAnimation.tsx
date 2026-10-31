const useModalAnimation = (isOpenModal: boolean, direction = "left") => {
  const desktopAnimate = {
    x: isOpenModal ? 0 : direction === "left" ? "-100%" : "100%",
  };
  const desktopInitial = { x: direction === "left" ? "-100%" : "100%" };

  return {
    animate: desktopAnimate,
    initial: desktopInitial,
  };
};

export default useModalAnimation;
