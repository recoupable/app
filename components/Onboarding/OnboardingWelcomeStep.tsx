"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useUserProvider } from "@/providers/UserProvder";

const RESEARCH_LINES = [
  "Identifying your industry footprint…",
  "Scanning music business context…",
  "Preparing your personalized workspace…",
  "Queueing artist intelligence tasks…",
  "Almost ready to change your workflow forever…",
];

const SOCIAL_PROOF = [
  "10,000+ artists managed",
  "50+ labels onboarded",
  "Used by teams at UMG, Def Jam & more",
];

interface Props {
  onDone: () => void;
}

/**
 * Animated welcome screen — uses Privy name/email, shows social proof, auto-advances.
 */
export function OnboardingWelcomeStep({ onDone }: Props) {
  const { email, userData } = useUserProvider();
  const [lineIdx, setLineIdx] = useState(0);
  const [done, setDone] = useState(false);

  // Infer first name from email or account name
  const firstName =
    userData?.name?.split(" ")[0] ||
    (email ? email.split("@")[0].replace(/[._]/g, " ").split(" ")[0] : null);

  // Capitalize first letter
  const displayName = firstName
    ? firstName.charAt(0).toUpperCase() + firstName.slice(1)
    : null;

  useEffect(() => {
    const interval = setInterval(() => {
      setLineIdx(prev => {
        const next = prev + 1;
        if (next >= RESEARCH_LINES.length) {
          clearInterval(interval);
          setDone(true);
          setTimeout(onDone, 700);
          return prev;
        }
        return next;
      });
    }, 520);
    return () => clearInterval(interval);
  }, [onDone]);

  return (
    <div className="flex flex-col items-center gap-7 py-4 text-center">
      {/* Animated orb */}
      <div className="relative flex items-center justify-center h-20 w-20">
        <div className="absolute inset-0 animate-ping rounded-full bg-primary/15" />
        <div className="absolute inset-2 animate-pulse rounded-full bg-primary/25" />
        <motion.div
          className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground text-3xl shadow-xl"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
        >
          🎵
        </motion.div>
      </div>

      {/* Headline */}
      <motion.div
        className="flex flex-col gap-1"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h1 className="text-2xl font-bold tracking-tight">
          {displayName
            ? `Hey ${displayName} — welcome to Recoupable.`
            : "Welcome to Recoupable."}
        </h1>
        <p className="text-sm text-muted-foreground">
          The AI platform built for people who actually move music.
        </p>
      </motion.div>

      {/* Social proof */}
      <motion.div
        className="flex flex-wrap justify-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        {SOCIAL_PROOF.map((s, i) => (
          <span
            key={i}
            className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground font-medium"
          >
            {s}
          </span>
        ))}
      </motion.div>

      {/* Animated research lines */}
      <div className="flex flex-col gap-1.5 w-full max-w-xs text-left">
        <AnimatePresence>
          {RESEARCH_LINES.map((line, i) =>
            i <= lineIdx ? (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 text-sm"
              >
                <span className="text-base">
                  {i < lineIdx ? "✅" : "⏳"}
                </span>
                <span className={i < lineIdx ? "text-foreground" : "text-foreground animate-pulse"}>
                  {line}
                </span>
              </motion.div>
            ) : null,
          )}
        </AnimatePresence>
      </div>

      {done && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs text-primary font-semibold animate-pulse"
        >
          Let&apos;s set you up →
        </motion.p>
      )}
    </div>
  );
}
