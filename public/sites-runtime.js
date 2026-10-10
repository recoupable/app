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
  const playerConfig = JSON.parse(document.body.dataset.playerConfig || "null");
  if (playerConfig?.flow) {
    const currentPlayerUrl = new URL(location.href);
    currentPlayerUrl.searchParams.set("flow", playerConfig.flow);
    history.replaceState(
      null,
      "",
      currentPlayerUrl.pathname + currentPlayerUrl.search,
    );
  }
  const sessionKey = playerConfig?.playerId
    ? "recoup-player-spotify:" + playerConfig.playerId
    : "recoup-sites-spotify";
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
          returnUrl.pathname === "/s/spotify/connect" ||
          /^\/listen\/[0-9a-f-]{36}\/(spotify|apple_music)$/.test(
            returnUrl.pathname,
          ))
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
      const token = pending.flow
        ? await (async () => {
            const response = await fetch("/api/players/spotify/session", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                code,
                verifier: pending.verifier,
                flow: pending.flow,
              }),
            });
            if (!response.ok)
              throw new Error(
                "Spotify could not complete this fan connection.",
              );
            return response.json();
          })()
        : await exchange({
            grant_type: "authorization_code",
            client_id: pending.clientId,
            code,
            redirect_uri: pending.redirectUri,
            code_verifier: pending.verifier,
          });
      const callbackSessionKey = pending.sessionKey || sessionKey;
      write(callbackSessionKey, {
        ...token,
        clientId: pending.clientId,
        expiresAt: Date.now() + token.expires_in * 1000,
      });
      if (pending.popup && window.opener) {
        window.opener.postMessage(
          { type: "recoup-spotify-session", session: read(callbackSessionKey) },
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
      playerUrl.searchParams.set("return", location.pathname);
      const siteId = location.pathname.match(/^\/s\/([0-9a-f-]{36})$/)?.[1];
      if (siteId) playerUrl.searchParams.set("site", siteId);
      for (const key of [
        "background",
        "foreground",
        "accent",
        "font",
        "title",
        "artist",
        "artwork",
      ]) {
        const value =
          document.body.dataset["theme" + key[0].toUpperCase() + key.slice(1)];
        if (value !== undefined) playerUrl.searchParams.set(key, value);
      }
      if (document.body.dataset.audioUrl)
        playerUrl.searchParams.set("audio", document.body.dataset.audioUrl);
      frame.src = playerUrl.href;
      const game = document.getElementById("experience");
      const entrance = document.getElementById("music-entrance");
      const toggle = document.getElementById("music-toggle");
      const panel = document.getElementById("music-panel");
      // Music is optional; never gate the generated experience on OAuth setup.
      document.body.dataset.entered = "true";
      game.inert = false;
      entrance.hidden = true;
      toggle.hidden = false;
      panel.classList.add("collapsed");
      toggle.setAttribute("aria-expanded", "false");
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
    const fanConnectUrl = document.body.dataset.fanConnectUrl;
    const connectFan = document.getElementById("fan-connect");
    if (connectFan && fanConnectUrl) {
      connectFan.onclick = () => {
        window.top.location.href = fanConnectUrl;
      };
    }
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
      skip.hidden =
        !parentOrigin || document.body.dataset.listeningOnly === "true";
      skip.onclick = () => {
        if (document.body.dataset.listeningOnly !== "true")
          notifyParent("recoup-music-continue");
      };
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
        if (document.body.dataset.listeningOnly === "true") {
          continueButton.hidden = true;
          return;
        }
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
    const intro = document.getElementById("spotify-intro");
    const audio = document.getElementById("site-audio");
    let audioActive = false;
    function activateSavedAudio() {
      if (!audio || !audio.src) return false;
      if (audioActive) return true;
      audioActive = true;
      if (player) player.disconnect();
      document.body.dataset.playbackSource = "audio";
      play.hidden = false;
      play.disabled = false;
      if (controls) controls.hidden = false;
      if (intro) intro.textContent = "Your music is ready.";
      const sync = () => {
        duration = Number.isFinite(audio.duration) ? audio.duration * 1000 : 0;
        latestState = {
          position: audio.currentTime * 1000,
          paused: audio.paused,
        };
        updatedAt = Date.now();
        updateProgress();
        play.setAttribute(
          "aria-label",
          audio.paused ? "Play music" : "Pause music",
        );
        if (audio.paused) delete play.dataset.playing;
        else play.dataset.playing = "true";
      };
      for (const event of [
        "loadedmetadata",
        "timeupdate",
        "play",
        "pause",
        "ended",
        "seeked",
      ])
        audio.addEventListener(event, sync);
      audio.addEventListener("error", () =>
        say("Music could not load. Reload this page to try again."),
      );
      audio.volume = 0.7;
      play.onclick = async () => {
        try {
          if (audio.paused) {
            await audio.play();
            say("Playing artist audio.", true);
          } else {
            audio.pause();
            say("Paused.", true);
          }
          sync();
        } catch {
          say("Tap Play music to start listening.");
        }
      };
      if (seek)
        seek.onchange = () => {
          if (Number.isFinite(audio.duration))
            audio.currentTime = (Number(seek.value) / 100) * audio.duration;
          sync();
        };
      const volume = document.getElementById("spotify-volume");
      if (volume)
        volume.oninput = () => {
          audio.volume = Number(volume.value) / 100;
        };
      const previous = document.getElementById("spotify-previous");
      if (previous) {
        previous.setAttribute("aria-label", "Restart track");
        previous.onclick = () => {
          audio.currentTime = 0;
          sync();
        };
      }
      const next = document.getElementById("spotify-next");
      if (next) next.hidden = true;
      const link = document.getElementById("spotify-track-link");
      if (link) link.href = document.body.dataset.release;
      document.getElementById("spotify-track").hidden = false;
      document.getElementById("spotify-artist-name").textContent =
        document.body.dataset.artist || "Music";
      const cover = document.getElementById("spotify-cover");
      const banner = document.getElementById("spotify-artist-image");
      if (banner && cover) banner.src = cover.src;
      disconnect.onclick = () => {
        audio.pause();
        sessionStorage.removeItem(sessionKey);
        location.reload();
      };
      sync();
      say("Music ready. Press Play music.", true);
      return true;
    }
    function showSavedAudio() {
      if (!activateSavedAudio()) return false;
      showPlayer();
      if (skip) skip.hidden = true;
      return true;
    }
    const configResponse = playerConfig?.spotify
      ? { ok: true, json: async () => playerConfig.spotify }
      : await fetch("/api/sites/spotify/config").catch(() => null);
    if (!configResponse?.ok) {
      if (showSavedAudio()) return;
      throw new Error("Spotify connection is temporarily unavailable.");
    }
    const config = await configResponse.json();
    if (
      !config.configured ||
      (document.body.dataset.fanSite === "true" && !fanConnectUrl)
    ) {
      connect.disabled = true;
      if (showSavedAudio()) return;
      say("Spotify connection is not configured. Open Spotify to listen.");
      return;
    }
    connect.onclick = async () => {
      try {
        if (fanConnectUrl) {
          window.top.location.href = fanConnectUrl;
          return;
        }
        if (parentOrigin) {
          const authUrl = new URL(location.href);
          authUrl.searchParams.delete("parent");
          if (document.body.dataset.playerFlow)
            authUrl.searchParams.set("flow", document.body.dataset.playerFlow);
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
          const fallback = document.createElement("a");
          const fallbackUrl = new URL(authUrl.href);
          fallbackUrl.searchParams.set("authorize", "tab");
          fallback.href = fallbackUrl.href;
          fallback.target = "_top";
          fallback.textContent = "Continue in this tab";
          if (status) status.appendChild(fallback);
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
        const returnUrl = new URL(
          location.pathname + location.search,
          location.origin,
        );
        returnUrl.searchParams.delete("authorize");
        write(pendingKey, {
          verifier,
          flow: document.body.dataset.playerFlow || null,
          sessionKey,
          popup: new URLSearchParams(location.search).get("authorize") === "1",
          state,
          created: Date.now(),
          clientId: config.clientId,
          redirectUri: config.redirectUri,
          returnPath: /^\/s\/[0-9a-f-]{36}$/.test(
            new URLSearchParams(location.search).get("return") || "",
          )
            ? new URLSearchParams(location.search).get("return")
            : returnUrl.pathname + returnUrl.search,
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
    if (
      ["1", "tab"].includes(
        new URLSearchParams(location.search).get("authorize"),
      )
    ) {
      await connect.onclick();
      return;
    }
    let session = read(sessionKey);
    if (playerConfig && session?.player_session_id !== playerConfig.sessionId)
      session = null;
    if (!session) {
      showSavedAudio();
      return;
    }
    if (continueButton && parentOrigin) continueButton.hidden = false;
    if (!parentOrigin) showPlayer();

    document.body.dataset.connected = "true";
    if (intro) intro.textContent = "Spotify connected. You’re ready to go.";
    connect.hidden = true;
    play.hidden = false;
    play.disabled = true;
    disconnect.hidden = false;
    disconnect.onclick = () => {
      if (player) player.disconnect();
      window.RecoupReleasePlayer?.event("disconnected");
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
    const notifyPlayback = (event) => {
      if (playerConfig && parentOrigin)
        window.parent.postMessage(
          { type: "recoup:playback", provider: "spotify", event },
          parentOrigin,
        );
    };
    if (playerConfig)
      notifyPlayback(session.fanCapture ? "fan_captured" : "capture_failed");
    let lastPlayback = "";
    let product = "unknown";
    try {
      const profileResponse = await fetch("https://api.spotify.com/v1/me", {
        headers: { Authorization: "Bearer " + (await getToken()) },
      });
      if (profileResponse.ok) {
        const profile = await profileResponse.json();
        if (["premium", "free", "open"].includes(profile.product))
          product = profile.product;
      }
    } catch {
      /* An unavailable profile is unknown, never evidence of a free account. */
    }
    document.body.dataset.spotifyProduct = product;
    const accountLabel = document.getElementById("spotify-account");
    if (accountLabel) {
      accountLabel.hidden = false;
      accountLabel.textContent =
        product === "premium"
          ? "Spotify Premium connected"
          : product === "unknown"
            ? "Spotify connected · subscription unavailable"
            : "Spotify Free connected";
    }
    notifyPlayback("connected");
    window.RecoupReleasePlayer?.event("connected");
    session.product = product;
    write(sessionKey, session);
    if (product === "free" || product === "open") {
      if (document.body.dataset.listeningOnly === "true") {
        play.hidden = true;
        if (continueButton) continueButton.hidden = true;
        say("Opening Spotify to listen…");
        if (parentOrigin) {
          window.parent.postMessage(
            { type: "recoup:open-dsp", provider: "spotify" },
            parentOrigin,
          );
        } else {
          location.assign(document.body.dataset.release);
        }
        return;
      }
      if (!activateSavedAudio()) {
        play.hidden = true;
        say("Spotify Free connected. Open Spotify to listen.");
      }
      return;
    }
    if (product === "unknown" && activateSavedAudio()) return;
    document.body.dataset.playbackSource = "spotify";
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
      if (previous)
        previous.onclick = act(
          () => (
            window.RecoupReleasePlayer?.event("skip"), player.previousTrack()
          ),
        );
      if (next)
        next.onclick = act(
          () => (window.RecoupReleasePlayer?.event("skip"), player.nextTrack()),
        );
      setInterval(updateProgress, 1000);
      player.addListener("ready", ({ device_id }) => {
        if (audioActive) return;
        deviceId = device_id;
        play.disabled = false;
        say(
          parentOrigin
            ? document.body.dataset.listeningOnly === "true"
              ? "Spotify connected. Press Listen."
              : "Spotify connected. Continue to start listening."
            : "Spotify connected. Press Play music.",
          true,
        );
      });
      player.addListener("not_ready", () => {
        if (audioActive) return;
        window.RecoupReleasePlayer?.state(null, true, 0, "stopped");
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
            if (!activateSavedAudio()) {
              play.hidden = true;
              if (controls) controls.hidden = true;
              say(
                "Spotify playback is unavailable for this account and this site has no audio file yet.",
              );
            }
          } else say(message);
        });
      player.addListener("player_state_changed", (state) => {
        if (state && !audioActive) {
          const playback =
            state.track_window.current_track.id + ":" + state.paused;
          window.RecoupReleasePlayer?.state(
            state.track_window.current_track.id,
            state.paused,
            state.position,
          );
          if (playback !== lastPlayback) {
            if (
              lastPlayback.split(":")[0] !== state.track_window.current_track.id
            )
              notifyPlayback("track_changed");
            if (lastPlayback.split(":")[1] !== String(state.paused))
              notifyPlayback(state.paused ? "paused" : "playing");
            lastPlayback = playback;
          }
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
