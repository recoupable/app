"use client";

import { Check, ArrowRight } from "lucide-react";
import type { SiteBuildProgress } from "@/lib/sites/buildProgress";
import styles from "./SiteCreationExperience.module.css";

const stages = [
  {
    id: "research",
    title: "Understand the release",
    detail: "Music, lyrics, artist, and visual identity",
  },
  {
    id: "design",
    title: "Shape the experience",
    detail: "Concept, references, and creative direction",
  },
  {
    id: "assets",
    title: "Create the assets",
    detail: "Artwork and media for the experience",
  },
  {
    id: "build",
    title: "Build the site",
    detail: "Layout, motion, and interactive features",
  },
  {
    id: "review",
    title: "Test and refine",
    detail: "Play through, review, and save your preview",
  },
];

export function SiteCreationExperience({
  progress,
}: {
  progress?: SiteBuildProgress;
}) {
  const current = stages.findIndex((stage) => stage.id === progress?.phase);
  return (
    <section className={styles.experience} aria-label="Site creation progress">
      <div className={styles.heading}>
        <p className={styles.eyebrow}>YOUR RELEASE → YOUR EXPERIENCE</p>
        <h2>Bringing it to life.</h2>
        <p>From the first idea to a playable preview.</p>
      </div>
      <p
        className={styles.status}
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        <span className={styles.liveDot} />
        {progress?.detail || "Connecting to your build…"}
        {!!progress?.reviewPass && (
          <span className={styles.pass}>Review {progress.reviewPass}</span>
        )}
      </p>
      <ol className={styles.timeline}>
        {stages.map((stage, index) => {
          const state =
            index < current ? "done" : index === current ? "active" : "next";
          return (
            <li
              key={stage.id}
              className={styles.stage}
              data-state={state}
              aria-current={state === "active" ? "step" : undefined}
            >
              <span className={styles.marker} aria-hidden="true">
                {state === "done" ? (
                  <Check size={15} />
                ) : state === "active" ? (
                  <ArrowRight size={15} />
                ) : (
                  String(index + 1).padStart(2, "0")
                )}
              </span>
              <div className={styles.stageCopy}>
                <h3>
                  {stage.title}
                  <span className={styles.srOnly}>
                    {" "}
                    —{" "}
                    {state === "done"
                      ? "complete or reused"
                      : state === "active"
                        ? "in progress"
                        : "up next"}
                  </span>
                </h3>
                <p>{stage.detail}</p>
                {state === "active" && (
                  <span className={styles.activity} aria-hidden="true" />
                )}
              </div>
            </li>
          );
        })}
      </ol>
      <p className={styles.footer}>
        You can leave this page. We’ll keep building.
      </p>
    </section>
  );
}
