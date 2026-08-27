import { useEffect, useRef, useState } from "react";

const useContainerHeight = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = useState(0);

  useEffect(() => {
    const checkHeight = () => {
      if (containerRef.current) {
        setTimeout(() => {
          const rect = containerRef.current?.getBoundingClientRect();
          const height = rect?.height;
          setContainerHeight(height ? height : 0);
        }, 350);
      }
    };
    
    checkHeight();
  });

  return { containerRef, containerHeight };
};

export default useContainerHeight;