import { useEffect, useRef } from "react";

interface UseObserverTargetOptions {
  onIntersect: () => void;
  enabled: boolean;
  threshold?: number;
}

const useObserverTarget = ({
  onIntersect,
  enabled,
  threshold = 0.1,
}: UseObserverTargetOptions) => {
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && enabled) {
          onIntersect();
        }
      },
      { threshold }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [enabled, onIntersect, threshold]);

  return observerTarget;
};

export default useObserverTarget;
