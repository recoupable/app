"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";

const COLORS = ["#6366f1", "#8b5cf6", "#a855f7", "#ec4899", "#f97316", "#facc15"];
const COUNT = 60;

interface Particle {
  id: number;
  x: number;
  color: string;
  size: number;
  delay: number;
  duration: number;
  rotateEnd: number;
  borderRadius: string;
}

function makeParticles(): Particle[] {
  return Array.from({ length: COUNT }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    size: 6 + Math.random() * 6,
    delay: Math.random() * 0.5,
    duration: 1.2 + Math.random() * 0.8,
    rotateEnd: (Math.random() - 0.5) * 720,
    borderRadius: Math.random() > 0.5 ? "50%" : "2px",
  }));
}

/**
 * Lightweight CSS confetti using Framer Motion — no external package needed.
 * Particles rain down from the top of the viewport.
 */
export function OnboardingConfetti() {
  const [particles] = useState<Particle[]>(makeParticles);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 2500);
    return () => clearTimeout(t);
  }, []);

  if (!visible) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-50 overflow-hidden"
      aria-hidden="true"
    >
      {particles.map(p => (
        <motion.div
          key={p.id}
          style={{
            position: "absolute",
            left: `${p.x}%`,
            top: "-10px",
            width: p.size,
            height: p.size,
            borderRadius: p.borderRadius,
            backgroundColor: p.color,
          }}
          initial={{ y: 0, opacity: 1, rotate: 0, scale: 1 }}
          animate={{
            y: "110vh",
            opacity: [1, 1, 0],
            rotate: p.rotateEnd,
            scale: [1, 1, 0.5],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            ease: "easeIn",
          }}
        />
      ))}
    </div>
  );
}
