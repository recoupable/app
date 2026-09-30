"use client";

import Image from "next/image";
import { useMemo } from "react";
import { renderSite } from "@/lib/sites/renderSite";
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
  releaseUrl,
}: {
  progress?: SiteBuildProgress;
  releaseUrl?: string;
}) {
  const current = stages.findIndex((stage) => stage.id === progress?.phase);
  const reveal = progress?.reveal;
  const snapshot = reveal?.preview;
  const preview = useMemo(
    () =>
      snapshot
        ? renderSite(snapshot).replace(
            "</head>",
            "<style>header{display:none!important}</style></head>",
          )
        : undefined,
    [snapshot],
  );
  const isAlbum = releaseUrl?.includes("/album/");
  return (
    <section className={styles.experience} aria-label="Site creation progress">
      <div className={styles.heading}>
        <p className={styles.eyebrow}>YOUR RELEASE → YOUR EXPERIENCE</p>
        <h2>Bringing it to life.</h2>
        <p>From the first idea to a playable preview.</p>
      </div>
      <div className={styles.workspace}>
        <div>
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
                index < current
                  ? "done"
                  : index === current
                    ? "active"
                    : "next";
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
                    {state === "active" && (
                      <p>
                        {stage.id === "research"
                          ? isAlbum
                            ? "Album details, artist, and cover artwork"
                            : "Gathering available release context"
                          : stage.detail}
                      </p>
                    )}
                    {state === "active" && (
                      <span className={styles.activity} aria-hidden="true" />
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
        <aside
          className={styles.reveal}
          aria-label="Your experience taking shape"
        >
          <p className={styles.eyebrow}>TAKING SHAPE</p>
          {reveal?.concept ? (
            <div className={styles.milestone} key={reveal.concept}>
              <h3>The idea</h3>
              <p className={styles.concept}>{reveal.concept}</p>
            </div>
          ) : (
            <div className={styles.empty}>
              <span aria-hidden="true">↗</span>
              <h3>Your first look is on its way.</h3>
              <p>
                The chosen idea, finished artwork, and working preview will
                appear here as they’re ready.
              </p>
            </div>
          )}
          {!!reveal?.assets.filter((asset) => asset.type !== "audio")
            .length && (
            <div className={styles.gallery}>
              {reveal.assets
                .filter((asset) => asset.type !== "audio")
                .map((asset) => (
                  <figure className={styles.milestone} key={asset.url}>
                    {asset.type === "video" ? (
                      <video
                        src={asset.url}
                        controls
                        muted
                        playsInline
                        preload="metadata"
                        aria-label={asset.name}
                      />
                    ) : (
                      <img src={asset.url} alt={asset.name} loading="lazy" />
                    )}
                    <figcaption>{asset.name}</figcaption>
                  </figure>
                ))}
            </div>
          )}
          {preview && (
            <div className={styles.milestone}>
              <div className={styles.previewLabel}>
                <h3>Working preview</h3>
                <span>Still being tested</span>
              </div>
              <iframe
                title="Experience in progress"
                sandbox="allow-scripts"
                srcDoc={preview}
                className={styles.preview}
              />
            </div>
          )}
          {reveal?.refinement && (
            <p className={styles.refinement} role="status">
              Refining: {reveal.refinement}
            </p>
          )}
        </aside>
      </div>
      <p className={styles.footer}>
        You can leave this page. We’ll keep building.
      </p>
    </section>
  );
}
