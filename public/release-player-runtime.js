/* SDK observations are reported listening activity, never authoritative DSP streams. */
(() => {
  const config = JSON.parse(document.body.dataset.playerConfig || "null");
  if (!config?.flow || !config.provider) return;
  let track = null,
    paused = true,
    position = 0,
    listened = 0,
    sampled = Date.now(),
    queue = Promise.resolve();
  const sample = () => {
    const now = Date.now();
    if (!paused && track)
      listened = Math.min(
        30000,
        listened + Math.max(0, Math.min(30000, now - sampled)),
      );
    sampled = now;
  };
  const report = (event) => {
    sample();
    const payload = {
      flow: config.flow,
      event: {
        id: crypto.randomUUID(),
        provider: config.provider,
        event,
        trackId: track,
        positionMs: Math.max(0, Math.min(86400000, Math.round(position))),
        listenedMs: Math.round(listened),
      },
    };
    listened = 0;
    queue = queue
      .catch(() => {})
      .then(() =>
        fetch("/api/players/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          keepalive: true,
        }),
      )
      .catch(() => {});
  };
  window.RecoupReleasePlayer = {
    event: report,
    state(nextTrack, nextPaused, nextPosition, terminal = "paused") {
      sample();
      if (nextTrack !== track) {
        if (track && listened) report("heartbeat");
        track = nextTrack || null;
        position = nextPosition || 0;
        report("track_changed");
      }
      position = nextPosition || 0;
      if (nextPaused !== paused) {
        // Change the flag before reporting: sample() must not add paused time.
        paused = nextPaused;
        report(paused ? terminal : "playing");
      }
    },
  };
  setInterval(() => {
    if (!paused && track) report("heartbeat");
  }, 15000);
  window.addEventListener("pagehide", () => {
    report("stopped");
    paused = true;
  });
})();
