/* MusicKit tokens never cross from Recoup to the external artist site. */
(async () => {
  const body = document.body;
  if (!body.hasAttribute("data-apple-player")) return;
  const node = (id) => document.getElementById("apple-" + id);
  const status = (message) => {
    node("status").textContent = message;
  };
  const notify = (event) => {
    if (body.dataset.playerParent)
      window.parent.postMessage(
        { type: "recoup:playback", provider: "apple_music", event },
        body.dataset.playerParent,
      );
  };
  try {
    const response = await fetch("/api/sites/apple/config");
    const config = response.ok && (await response.json());
    if (!config?.configured) {
      status(
        "Apple Music sign-in is unavailable. You can open Apple Music below.",
      );
      return;
    }
    document.addEventListener(
      "musickitloaded",
      async () => {
        try {
          await window.MusicKit.configure({
            developerToken: config.developerToken,
            app: { name: "Recoup", build: "1" },
          });
          const music = window.MusicKit.getInstance();
          const events = window.MusicKit.Events;
          music.addEventListener(events.playbackStateDidChange, () => {
            const states = window.MusicKit.PlaybackStates;
            const playing = music.playbackState === states.playing;
            node("play").textContent = playing ? "Pause" : "Play";
            if (playing || music.playbackState === states.paused) {
              notify(playing ? "playing" : "paused");
              window.RecoupReleasePlayer?.state(
                music.nowPlayingItem?.id || null,
                !playing,
                (music.currentPlaybackTime || 0) * 1000,
              );
            } else if (
              [states.stopped, states.ended, states.completed].includes(
                music.playbackState,
              )
            ) {
              window.RecoupReleasePlayer?.state(
                music.nowPlayingItem?.id || null,
                true,
                (music.currentPlaybackTime || 0) * 1000,
                "stopped",
              );
            }
          });
          music.addEventListener(events.nowPlayingItemDidChange, () => {
            node("track").textContent = music.nowPlayingItem?.title || "";
            notify("track_changed");
            window.RecoupReleasePlayer?.state(
              music.nowPlayingItem?.id || null,
              music.playbackState !== window.MusicKit.PlaybackStates.playing,
              (music.currentPlaybackTime || 0) * 1000,
            );
          });
          const connect = node("connect");
          connect.disabled = false;
          status("");
          connect.onclick = async () => {
            connect.disabled = true;
            try {
              await music.authorize();
              await music.setQueue({
                [body.dataset.releaseKind]: body.dataset.releaseId,
              });
              connect.hidden = true;
              node("controls").hidden = false;
              notify("connected");
              window.RecoupReleasePlayer?.event("connected");
              status("Connected. Press Play to listen.");
            } catch {
              status("Could not connect. Try again or open Apple Music below.");
            } finally {
              connect.disabled = false;
            }
          };
          const act = (fn) => async () => {
            try {
              await fn();
            } catch {
              status(
                "Playback unavailable. Try again or open Apple Music below.",
              );
            }
          };
          node("play").onclick = act(() =>
            music.playbackState === window.MusicKit.PlaybackStates.playing
              ? music.pause()
              : music.play(),
          );
          node("next").onclick = act(
            () => (
              window.RecoupReleasePlayer?.event("skip"), music.skipToNextItem()
            ),
          );
          node("previous").onclick = act(
            () => (
              window.RecoupReleasePlayer?.event("skip"),
              music.skipToPreviousItem()
            ),
          );
          node("disconnect").onclick = act(async () => {
            window.RecoupReleasePlayer?.event("disconnected");
            await music.stop();
            await music.unauthorize();
            location.reload();
          });
        } catch {
          status("Apple Music could not initialize. Open Apple Music below.");
        }
      },
      { once: true },
    );
    const script = document.createElement("script");
    script.src = "https://js-cdn.music.apple.com/musickit/v3/musickit.js";
    script.onerror = () =>
      status("Apple Music could not load. Open Apple Music below.");
    document.head.appendChild(script);
  } catch {
    status("Apple Music is unavailable. Open Apple Music below.");
  }
})();
