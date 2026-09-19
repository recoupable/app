/* Trusted fan controls. Generated experiences never receive OAuth tokens. */
(async () => {
  "use strict";
  const status = document.getElementById("spotify-status");
  const say = (text) => {
    if (status) status.textContent = text;
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
      const safeReturn =
        pending && /^\/s\/[0-9a-f-]{36}$/.test(pending.returnPath)
          ? pending.returnPath
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
      location.replace(safeReturn);
      return;
    }
    if (!document.body.hasAttribute("data-sites-runtime")) return;
    const connect = document.getElementById("spotify-connect");
    const play = document.getElementById("spotify-play");
    const disconnect = document.getElementById("spotify-disconnect");
    if (document.body.dataset.preview === "true") {
      connect.disabled = true;
      return;
    }
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
          state,
          created: Date.now(),
          clientId: config.clientId,
          redirectUri: config.redirectUri,
          returnPath: location.pathname,
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
    let session = read(sessionKey);
    if (!session) return;
    let player;
    let deviceId;
    let started = false;
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
    say("Connected. Preparing your music player…");
    window.onSpotifyWebPlaybackSDKReady = () => {
      player = new window.Spotify.Player({
        name: "Recoup Sites",
        volume: 0.7,
        getOAuthToken: (cb) =>
          getToken()
            .then(cb)
            .catch((e) => say(e.message)),
      });
      player.addListener("ready", ({ device_id }) => {
        deviceId = device_id;
        play.disabled = false;
        say("Spotify connected. Press Play music.");
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
        player.addListener(event, ({ message }) => say(message));
      player.addListener("player_state_changed", (state) => {
        if (state) {
          play.textContent = state.paused ? "Play music" : "Pause music";
          const track = state.track_window.current_track;
          const label = document.getElementById("spotify-track-link");
          const cover = document.getElementById("spotify-cover");
          label.textContent =
            track.name +
            " · " +
            track.artists.map((a) => a.name).join(", ") +
            " · Spotify";
          label.href =
            "https://open.spotify.com/track/" + encodeURIComponent(track.id);
          cover.src = track.album.images[0]?.url || "";
          cover.alt = track.album.name;
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
        say("Playing on Spotify.");
      } catch (e) {
        say(e.message);
      }
    };
  } catch (e) {
    say(e.message || "Spotify could not connect. Please try again.");
  }
})();
