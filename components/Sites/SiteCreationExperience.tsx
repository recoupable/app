"use client";

import { useRef, useState, type CSSProperties } from "react";
import { Pause, Play } from "lucide-react";
import styles from "./SiteCreationExperience.module.css";

/** One artwork, divided into pieces that always return to their original place. */
export function SiteCreationExperience({ artwork }: { artwork?: string }) {
  const [paused, setPaused] = useState(false);
  const scene = useRef<HTMLDivElement>(null);
  const image = artwork ? `url(${JSON.stringify(artwork)})` : "none";

  return (
    <section className={styles.experience} aria-label="Site creation">
      <div
        ref={scene}
        className={styles.scene}
        data-paused={paused}
        style={{ "--artwork": image } as CSSProperties}
        aria-hidden="true"
        onPointerMove={(event) => {
          if (event.pointerType !== "mouse" || !scene.current) return;
          const bounds = event.currentTarget.getBoundingClientRect();
          scene.current.style.setProperty(
            "--tilt-x",
            `${(-(event.clientY - bounds.top - bounds.height / 2) / bounds.height) * 12}deg`,
          );
          scene.current.style.setProperty(
            "--tilt-y",
            `${((event.clientX - bounds.left - bounds.width / 2) / bounds.width) * 12}deg`,
          );
        }}
        onPointerLeave={() => {
          scene.current?.style.setProperty("--tilt-x", "0deg");
          scene.current?.style.setProperty("--tilt-y", "0deg");
        }}
      >
        <div className={styles.halo} />
        <div className={styles.frame} />
        <div className={styles.sculpture}>
          {Array.from({ length: 25 }, (_, index) => {
            const x = index % 5;
            const y = Math.floor(index / 5);
            return (
              <span
                key={index}
                className={styles.piece}
                style={
                  {
                    "--x": x,
                    "--y": y,
                    "--drift-x": `${(x - 2) * 27}%`,
                    "--drift-y": `${(y - 2) * 27}%`,
                    "--twist": `${(x - y) * 3}deg`,
                    "--depth": `${(Math.abs(x - 2) + Math.abs(y - 2)) * 12}px`,
                    "--delay": `${(x + y) * -0.12}s`,
                    backgroundPosition: `${x * 25}% ${y * 25}%`,
                  } as CSSProperties
                }
              />
            );
          })}
        </div>
        <span className={styles.caption}>
          A RELEASE. A WORLD OF POSSIBILITIES.
        </span>
      </div>
      <div className={styles.copy}>
        <p className={styles.eyebrow}>
          <span />
          CREATION IN MOTION
        </p>
        <h2>
          Your music.
          <br />A whole new world.
        </h2>
        <p role="status">
          We’re creating your experience.
          <br />
          Your preview will appear here when it’s ready.
        </p>
      </div>
      <div className={styles.footer}>
        <span>You can leave this page. We’ll keep building.</span>
        <button
          type="button"
          className={styles.pause}
          onClick={() => setPaused(!paused)}
          aria-pressed={paused}
          aria-label={paused ? "Resume animation" : "Pause animation"}
        >
          {paused ? <Play size={13} /> : <Pause size={13} />}
          {paused ? "Resume motion" : "Pause motion"}
        </button>
      </div>
    </section>
  );
}
