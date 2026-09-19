/* Trusted fan controls. Generated experiences never receive OAuth tokens. */
(async () => {
  "use strict";
  const status = document.getElementById("spotify-status");
  const say = (text, quiet = false) => {
    if (status) {
      status.textContent = text;
      status.hidden = quiet;
    }
  };
  const sessionKey = "recoup-sites-spotify";
  const pendingKey = "recoup-sites-spotify-pending";
  const read = (key) => {
    try {
      return JSON.parse(sessionStorage.getItem(key) || "null");
    } catch {
      return null;
    }
  };
  const write = (key, value) =>
    sessionStorage.setItem(key, JSON.stringify(value));
  const random = () =>
    Array.from(crypto.getRandomValues(new Uint8Array(32)), (b) =>
      b.toString(16).padStart(2, "0"),
    ).join("");
  async function exchange(values) {
    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(values),
    });
    if (!response.ok)
      throw new Error(
        "Spotify could not complete the connection. Please reconnect.",
      );
    const token = await response.json();
    if (!token.access_token)
      throw new Error("Spotify did not return a session. Please reconnect.");
    return token;
  }
  try {
    if (document.body.hasAttribute("data-spotify-callback")) {
      const pending = read(pendingKey);
      sessionStorage.removeItem(pendingKey);
      const query = new URLSearchParams(location.search);
      const code = query.get("code");
      const returnUrl = new URL(pending?.returnPath || "/", location.origin);
      const safeReturn =
        returnUrl.origin === location.origin &&
        (/^\/s\/[0-9a-f-]{36}$/.test(returnUrl.pathname) ||
          returnUrl.pathname === "/s/spotify/connect")
          ? returnUrl.pathname + returnUrl.search
          : "/";
      const link = document.getElementById("return-link");
      link.href = safeReturn;
      history.replaceState(null, "", location.pathname);
      if (query.has("error"))
        throw new Error(
          "Spotify connection was cancelled. You can return and keep playing.",
        );
      if (
        !pending ||
        pending.state !== query.get("state") ||
        !code ||
        Date.now() - pending.created > 600000
      )
        throw new Error(
          "This connection expired. Return to the site and connect again.",
        );
      const token = await exchange({
        grant_type: "authorization_code",
        client_id: pending.clientId,
        code,
        redirect_uri: pending.redirectUri,
        code_verifier: pending.verifier,
      });
      write(sessionKey, {
        ...token,
        clientId: pending.clientId,
        expiresAt: Date.now() + token.expires_in * 1000,
      });
      if (pending.popup && window.opener) {
        window.opener.postMessage(
          { type: "recoup-spotify-session", session: read(sessionKey) },
          location.origin,
        );
        say("Connected. Return to your experience.");
        window.close();
        return;
      }
      location.replace(safeReturn);
      return;
    }
    if (!document.body.hasAttribute("data-sites-runtime")) return;
    const connect = document.getElementById("spotify-connect");
    const play = document.getElementById("spotify-play");
    const disconnect = document.getElementById("spotify-disconnect");
    const openPlayer = (url) => {
      window.open(
        url,
        "_blank",
        "popup,width=460,height=640,noopener,noreferrer",
      );
      say(
        "Keep the Spotify window open for music. If it did not open, use this link: ",
      );
      const fallback = document.createElement("a");
      fallback.href = url;
      fallback.target = "_blank";
      fallback.rel = "noopener noreferrer";
      fallback.textContent = "Open Spotify player";
      if (status) status.appendChild(fallback);
    };
    if (document.body.dataset.preview === "true") {
      const url = document.body.dataset.connectUrl;
      connect.disabled = !url;
      if (url) connect.onclick = () => openPlayer(url);
      return;
    }
    if (document.body.dataset.spotifyPlayer !== "true") {
      const frame = document.getElementById("music-frame");
      if (!frame) return;
      const playerUrl = new URL(
        document.body.dataset.connectUrl || "/s/spotify/connect",
        location.origin,
      );
      playerUrl.searchParams.set(
        "release",
        document.body.dataset.release || "",
      );
      playerUrl.searchParams.set("parent", location.origin);
      if (document.body.dataset.audioUrl)
        playerUrl.searchParams.set("audio", document.body.dataset.audioUrl);
      frame.src = playerUrl.href;
      const game = document.getElementById("experience");
      const entrance = document.getElementById("music-entrance");
      const toggle = document.getElementById("music-toggle");
      const panel = document.getElementById("music-panel");
      game.inert = true;
      const enter = () => {
        document.body.dataset.entered = "true";
        frame.contentWindow.postMessage(
          { type: "recoup-music-entered" },
          playerUrl.origin,
        );
        game.inert = false;
        entrance.hidden = true;
        toggle.hidden = false;
        panel.classList.add("collapsed");
        toggle.setAttribute("aria-label", "Open music player");
        toggle.setAttribute("aria-expanded", "false");
        game.focus();
      };

      toggle.onclick = () => {
        const collapsed = panel.classList.toggle("collapsed");
        toggle.setAttribute(
          "aria-label",
          collapsed ? "Open music player" : "Minimize player",
        );
        toggle.setAttribute("aria-expanded", String(!collapsed));
      };
      window.addEventListener("message", (event) => {
        if (
          event.source !== frame.contentWindow ||
          event.origin !== playerUrl.origin
        )
          return;
        if (event.data?.type === "recoup-music-continue") enter();
        if (event.data?.type === "recoup-music-minimize") {
          panel.classList.add("collapsed");
          toggle.hidden = false;
          toggle.setAttribute("aria-expanded", "false");
        }
        if (
          event.data?.type === "recoup-music-resize" &&
          Number.isFinite(event.data.height)
        ) {
          frame.style.height =
            Math.min(560, Math.max(160, event.data.height)) + "px";
        }
      });
      return;
    }
    const parentOrigin = document.body.dataset.playerParent;
    const continueButton = document.getElementById("spotify-continue");
    const notifyParent = (type) => {
      if (parentOrigin) window.parent.postMessage({ type }, parentOrigin);
    };
    for (const id of ["spotify-minimize", "spotify-player-minimize"]) {
      const button = document.getElementById(id);
      if (button) button.onclick = () => notifyParent("recoup-music-minimize");
    }
    const skip = document.getElementById("spotify-skip");
    if (skip) {
      skip.hidden = !parentOrigin;
      skip.onclick = () => notifyParent("recoup-music-continue");
    }
    if (parentOrigin && typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver(() =>
        window.parent.postMessage(
          {
            type: "recoup-music-resize",
            height: Math.ceil(
              document
                .getElementById("syncstream-player")
                .getBoundingClientRect().height,
            ),
          },
          parentOrigin,
        ),
      );
      observer.observe(document.getElementById("syncstream-player"));
    }
    const showPlayer = () => {
      document.body.dataset.playerVisible = "true";
      const display = document.getElementById("player-display");
      if (display) display.hidden = false;
    };
    if (parentOrigin && continueButton)
      continueButton.onclick = async () => {
        showPlayer();
        if (!play.disabled && play.onclick) await play.onclick();
        window.parent.postMessage(
          { type: "recoup-music-continue" },
          parentOrigin,
        );
      };
    if (parentOrigin)
      window.addEventListener("message", (event) => {
        if (
          event.source === window.parent &&
          event.origin === parentOrigin &&
          event.data?.type === "recoup-music-entered"
        ) {
          if (continueButton) continueButton.hidden = true;
          if (skip) skip.hidden = true;
          if (document.body.dataset.connected === "true") showPlayer();
        }
      });
    let authPopup;
    if (parentOrigin)
      window.addEventListener("message", (event) => {
        if (
          !authPopup ||
          event.source !== authPopup ||
          event.origin !== location.origin
        )
          return;
        if (
          event.data?.type !== "recoup-spotify-session" ||
          typeof event.data.session?.access_token !== "string"
        )
          return;
        write(sessionKey, event.data.session);
        authPopup = null;
        location.reload();
      });
    const configResponse = await fetch("/api/sites/spotify/config");
    if (!configResponse.ok)
      throw new Error("Spotify connection is temporarily unavailable.");
    const config = await configResponse.json();
    if (!config.configured) {
      connect.disabled = true;
      say(
        "Spotify connection is not configured for this site yet. You can still play.",
      );
      return;
    }
    connect.onclick = async () => {
      try {
        if (parentOrigin) {
          const authUrl = new URL(location.href);
          authUrl.searchParams.delete("parent");
          authUrl.searchParams.set("authorize", "1");
          authPopup = window.open(
            authUrl.href,
            "recoup-spotify-auth",
            "popup,width=460,height=640",
          );
          say(
            authPopup
              ? "Finish connecting in the Spotify window."
              : "Allow popups to connect Spotify, then try again.",
          );
          return;
        }
        const verifier = random();
        const state = random();
        const digest = await crypto.subtle.digest(
          "SHA-256",
          new TextEncoder().encode(verifier),
        );
        const challenge = btoa(String.fromCharCode(...new Uint8Array(digest)))
          .replace(/\+/g, "-")
          .replace(/\//g, "_")
          .replace(/=+$/, "");
        const callback = new URL(config.redirectUri);
        if (callback.origin !== location.origin)
          throw new Error(
            "Open this site on " + callback.origin + " to connect Spotify.",
          );
        write(pendingKey, {
          verifier,
          popup: new URLSearchParams(location.search).get("authorize") === "1",
          state,
          created: Date.now(),
          clientId: config.clientId,
          redirectUri: config.redirectUri,
          returnPath: location.pathname + location.search,
        });
        const params = new URLSearchParams({
          client_id: config.clientId,
          response_type: "code",
          redirect_uri: config.redirectUri,
          state,
          code_challenge_method: "S256",
          code_challenge: challenge,
          scope:
            "streaming user-read-email user-read-private user-modify-playback-state",
        });
        location.assign("https://accounts.spotify.com/authorize?" + params);
      } catch (e) {
        say(e.message);
      }
    };
    if (new URLSearchParams(location.search).get("authorize") === "1") {
      await connect.onclick();
      return;
    }
    let session = read(sessionKey);
    if (!session) return;
    let player;
    let deviceId;
    let started = false;
    let duration = 0;
    let latestState = null;
    let updatedAt = Date.now();
    const seek = document.getElementById("spotify-seek");
    const time = document.getElementById("spotify-time");
    const controls = document.getElementById("spotify-controls");
    const format = (ms) => {
      const seconds = Math.floor(ms / 1000);
      return (
        Math.floor(seconds / 60) + ":" + String(seconds % 60).padStart(2, "0")
      );
    };
    const updateProgress = () => {
      if (!latestState || !seek || !time) return;
      const position = Math.min(
        duration,
        latestState.position +
          (latestState.paused ? 0 : Date.now() - updatedAt),
      );
      seek.value = duration ? (position / duration) * 100 : 0;
      const positionLabel = document.getElementById("spotify-position");
      if (positionLabel) positionLabel.textContent = format(position);
      time.textContent = format(duration);
      const durationLabel = document.getElementById("spotify-duration");
      if (durationLabel) durationLabel.textContent = format(duration);
    };
    if (continueButton && parentOrigin) continueButton.hidden = false;
    if (!parentOrigin) showPlayer();

    document.body.dataset.connected = "true";
    const intro = document.getElementById("spotify-intro");
    if (intro) intro.textContent = "Spotify connected. You’re ready to go.";
    connect.hidden = true;
    play.hidden = false;
    play.disabled = true;
    disconnect.hidden = false;
    disconnect.onclick = () => {
      if (player) player.disconnect();
      sessionStorage.removeItem(sessionKey);
      location.reload();
    };
    async function getToken() {
      if (session.expiresAt < Date.now() + 60000) {
        if (!session.refresh_token)
          throw new Error(
            "Your Spotify session expired. Disconnect and reconnect.",
          );
        const fresh = await exchange({
          grant_type: "refresh_token",
          refresh_token: session.refresh_token,
          client_id: session.clientId,
        });
        session = {
          ...session,
          ...fresh,
          expiresAt: Date.now() + fresh.expires_in * 1000,
        };
        write(sessionKey, session);
      }
      return session.access_token;
    }
    say("Preparing music…", true);
    window.onSpotifyWebPlaybackSDKReady = () => {
      player = new window.Spotify.Player({
        name: "Recoup Sites",
        volume: 0.7,
        getOAuthToken: (cb) =>
          getToken()
            .then(cb)
            .catch((e) => say(e.message)),
      });
      const act = (fn) => async () => {
        try {
          await fn();
        } catch (e) {
          say(e.message || "Playback control unavailable.");
        }
      };
      if (seek)
        seek.onchange = act(() =>
          player.seek((Number(seek.value) / 100) * duration),
        );
      const volume = document.getElementById("spotify-volume");
      if (volume)
        volume.oninput = act(() =>
          player.setVolume(Number(volume.value) / 100),
        );
      const previous = document.getElementById("spotify-previous");
      const next = document.getElementById("spotify-next");
      if (previous) previous.onclick = act(() => player.previousTrack());
      if (next) next.onclick = act(() => player.nextTrack());
      setInterval(updateProgress, 1000);
      player.addListener("ready", ({ device_id }) => {
        deviceId = device_id;
        play.disabled = false;
        say(
          parentOrigin
            ? "Spotify connected. Continue to start listening."
            : "Spotify connected. Press Play music.",
          true,
        );
      });
      player.addListener("not_ready", () => {
        deviceId = null;
        play.disabled = true;
        say("Player disconnected. Reconnect Spotify.");
      });
      for (const event of [
        "initialization_error",
        "authentication_error",
        "account_error",
        "playback_error",
      ])
        player.addListener(event, ({ message }) => {
          if (event === "account_error") {
            const audioFallback = document.getElementById("audio-fallback");
            if (audioFallback) audioFallback.hidden = false;
            play.hidden = true;
            if (controls) controls.hidden = true;
            say(
              "Connected. Spotify Premium is needed to listen here. Open Spotify or continue without music.",
            );
          } else say(message);
        });
      player.addListener("player_state_changed", (state) => {
        if (state) {
          latestState = state;
          updatedAt = Date.now();
          duration = state.duration;
          started = true;
          if (controls) controls.hidden = false;
          updateProgress();
          play.setAttribute(
            "aria-label",
            state.paused ? "Play music" : "Pause music",
          );
          if (state.paused) delete play.dataset.playing;
          else play.dataset.playing = "true";
          say(state.paused ? "Paused." : "Playing on Spotify.", true);
          const track = state.track_window.current_track;
          const label = document.getElementById("spotify-track-link");
          const cover = document.getElementById("spotify-cover");
          label.textContent = track.name;
          label.href =
            "https://open.spotify.com/track/" + encodeURIComponent(track.id);
          cover.src = track.album.images[0]?.url || "";
          cover.alt = track.album.name;
          const artistName = document.getElementById("spotify-artist-name");
          const artistImage = document.getElementById("spotify-artist-image");
          if (artistName)
            artistName.textContent = track.artists
              .map((a) => a.name)
              .join(", ");
          if (artistImage) artistImage.src = track.album.images[0]?.url || "";
          document.getElementById("spotify-track").hidden = false;
        }
      });
      player
        .connect()
        .then((ok) => {
          if (!ok) say("Player unavailable. Try reconnecting Spotify.");
        })
        .catch((e) => say(e.message));
    };
    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.onerror = () =>
      say("The Spotify player could not load. Try again later.");
    document.head.appendChild(script);
    play.onclick = async () => {
      try {
        if (!deviceId) throw new Error("The Spotify player is not ready yet.");
        await player.activateElement();
        if (started) {
          await player.togglePlay();
          return;
        }
        const url = new URL(document.body.dataset.release);
        const match =
          url.hostname === "open.spotify.com" &&
          url.pathname.match(
            /^\/(?:intl-[a-z]+\/)?(track|album|playlist)\/([A-Za-z0-9]+)\/?$/,
          );
        if (!match)
          throw new Error(
            "This experience needs a Spotify track, album, or playlist link for playback.",
          );
        const uri = "spotify:" + match[1] + ":" + match[2];
        const response = await fetch(
          "https://api.spotify.com/v1/me/player/play?device_id=" +
            encodeURIComponent(deviceId),
          {
            method: "PUT",
            headers: {
              Authorization: "Bearer " + (await getToken()),
              "Content-Type": "application/json",
            },
            body: JSON.stringify(
              match[1] === "track" ? { uris: [uri] } : { context_uri: uri },
            ),
          },
        );
        if (!response.ok)
          throw new Error(
            response.status === 403
              ? "Spotify Premium is required for browser playback."
              : "Spotify could not start this release. Try Open music.",
          );
        started = true;
        say("Playing on Spotify.", true);
      } catch (e) {
        say(e.message);
      }
    };
  } catch (e) {
    say(e.message || "Spotify could not connect. Please try again.");
  }
})();
