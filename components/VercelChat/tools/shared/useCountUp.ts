"use client";

import React from "react";
import {
  animate,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type MotionValue,
} from "framer-motion";

/**
 * Tweens an integer toward `target` whenever it changes, returning a MotionValue
 * suitable for rendering inside a `motion.span`. Respects prefers-reduced-motion:
 * when reduced, the value snaps to the target instead of animating.
 */
export function useCountUp(target: number): MotionValue<number> {
  const reduce = useReducedMotion();
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));

  React.useEffect(() => {
    if (reduce) {
      count.set(target);
      return;
    }
    const controls = animate(count, target, {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    });
    return controls.stop;
  }, [target, count, reduce]);

  return rounded;
}
