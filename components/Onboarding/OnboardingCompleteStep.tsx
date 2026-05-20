"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { OnboardingConfetti } from "./OnboardingConfetti";

interface Props {
  artistNames: string[];
  name: string | undefined;
  connectedCount: number;
  pulseEnabled: boolean;
  onComplete: () => void;
}

/**
 * The "aha moment" — everything summarized with Framer Motion reveals + confetti.
 */
export function OnboardingCompleteStep({
  artistNames,
  name,
  connectedCount,
  pulseEnabled,
  onComplete,
}: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  const summaryItems = [
    artistNames.length > 0 && {
      icon: "🎤",
      text: `Deep research running on ${artistNames.slice(0, 2).join(" & ")}${
        artistNames.length > 2 ? ` +${artistNames.length - 2} more` : ""
      }`,
    },
    connectedCount > 0 && {
      icon: "🔗",
      text: `${connectedCount} platform${connectedCount > 1 ? "s" : ""} connected`,
    },
    pulseEnabled && {
      icon: "⚡",
      text: "Pulse active — briefing arrives tomorrow morning",
    },
    { icon: "✅", text: "First week of tasks queued" },
    { icon: "🧠", text: "AI learning your artists and fans right now" },
  ].filter(Boolean) as { icon: string; text: string }[];

  return (
    <AnimatePresence>
      {visible && (
        <>
          <OnboardingConfetti />
          <motion.div
          className="flex flex-col items-center gap-7 text-center"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          {/* Trophy */}
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 12, delay: 0.1 }}
            className="text-6xl"
          >
            🚀
          </motion.div>

          <motion.div
            className="flex flex-col gap-1.5"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <h2 className="text-2xl font-bold tracking-tight leading-tight">
              {name ? `${name.split(" ")[0]}, you're already ahead.` : "You're already ahead."}
            </h2>
            <p className="text-sm text-muted-foreground max-w-xs">
              While competitors are guessing, you have AI running intelligence on every move.
            </p>
          </motion.div>

          {/* Summary items */}
          <div className="flex flex-col gap-2.5 w-full text-left">
            {summaryItems.map((item, i) => (
              <motion.div
                key={i}
                className="flex items-center gap-3 rounded-xl border bg-muted/30 px-4 py-3 text-sm"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 + i * 0.07 }}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="font-medium">{item.text}</span>
              </motion.div>
            ))}
          </div>

          <motion.div
            className="flex flex-col gap-3 w-full"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Button onClick={onComplete} className="w-full text-base py-5">
              Open my dashboard 🎯
            </Button>
            <p className="text-xs text-muted-foreground">
              Your peers in music will want to know what you&apos;re using.
              You don&apos;t have to tell them.
            </p>
          </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
