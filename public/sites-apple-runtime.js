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
            const playing =
              music.playbackState === window.MusicKit.PlaybackStates.playing;
            node("play").textContent = playing ? "Pause" : "Play";
            notify(playing ? "playing" : "paused");
          });
          music.addEventListener(events.nowPlayingItemDidChange, () => {
            node("track").textContent = music.nowPlayingItem?.title || "";
            notify("track_changed");
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
          node("next").onclick = act(() => music.skipToNextItem());
          node("previous").onclick = act(() => music.skipToPreviousItem());
          node("disconnect").onclick = act(async () => {
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
