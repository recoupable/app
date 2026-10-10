/* Playlist browsing stays inside the trusted player; tokens never reach the artist website. */
(() => {
  window.RecoupSpotifyPlaylist = {
    create({ release, getToken, start }) {
      const section = document.getElementById("spotify-playlist");
      const title = document.getElementById("spotify-playlist-title");
      const list = document.getElementById("spotify-playlist-tracks");
      const status = document.getElementById("spotify-playlist-status");
      const more = document.getElementById("spotify-playlist-more");
      const rows = [];
      let selectedPosition = null,
        currentId = null;
      let offset = 0,
        total = 0,
        ready = false,
        busy = false,
        loading = false;
      let match = null;
      try {
        const url = new URL(release);
        if (url.hostname === "open.spotify.com")
          match = url.pathname.match(
            /^\/(?:intl-[a-z-]+\/)?playlist\/([A-Za-z0-9]+)\/?$/,
          );
      } catch {
        /* Non-playlist destinations retain the compact player. */
      }
      const enabled = () =>
        rows.forEach(({ button, playable }) => {
          button.disabled = !playable || !ready || busy;
        });
      const highlight = () => {
        const matches = rows.filter(({ id }) => currentId && id === currentId);
        const current =
          matches.find(({ position }) => position === selectedPosition) ||
          matches[0];
        rows.forEach((row) => {
          if (row === current) row.button.setAttribute("aria-current", "true");
          else row.button.removeAttribute("aria-current");
        });
      };
      async function request(path) {
        const response = await fetch("https://api.spotify.com/v1/" + path, {
          headers: { Authorization: "Bearer " + (await getToken()) },
        });
        if (!response.ok)
          throw new Error(
            "Song list unavailable. Use Open in Spotify to browse the playlist.",
          );
        return response.json();
      }
      async function page() {
        if (loading) return;
        loading = true;
        more.disabled = true;
        try {
          // SyncStream is Extended Quota Mode: Spotify documents the existing /tracks API as unchanged.
          const data = await request(
            "playlists/" + match[1] + "/tracks?limit=50&offset=" + offset,
          );
          if (!Array.isArray(data.items))
            throw new Error(
              "Song list unavailable. Use Open in Spotify to browse the playlist.",
            );
          for (let i = 0; i < data.items.length; i++) {
            const track = data.items[i]?.track;
            const position = offset + i;
            const playable = Boolean(
              track?.type === "track" &&
                /^[A-Za-z0-9]+$/.test(track.id || "") &&
                !track.is_local &&
                track.is_playable !== false &&
                !track.restrictions?.reason,
            );
            const row = document.createElement("li");
            const button = document.createElement("button");
            button.type = "button";
            button.className = "playlist-song";
            const name = document.createElement("span");
            name.className = "playlist-song-name";
            name.textContent =
              position + 1 + ". " + (track?.name || "Unavailable song");
            const detail = document.createElement("span");
            detail.className = "playlist-song-detail";
            const seconds = Math.floor((track?.duration_ms || 0) / 1000);
            detail.textContent = playable
              ? (track.artists || []).map((a) => a.name).join(", ") +
                " · " +
                Math.floor(seconds / 60) +
                ":" +
                String(seconds % 60).padStart(2, "0")
              : "Unavailable for playback";
            button.appendChild(name);
            button.appendChild(detail);
            button.onclick = async () => {
              if (!playable || !ready || busy) return;
              busy = true;
              enabled();
              const previousPosition = selectedPosition;
              selectedPosition = position;
              try {
                await start(position);
                status.textContent = "";
              } catch (error) {
                selectedPosition = previousPosition;
                status.textContent =
                  error.message || "Playback unavailable. Try Open in Spotify.";
              } finally {
                busy = false;
                enabled();
                highlight();
              }
            };
            rows.push({ button, playable, id: track?.id, position });
            row.appendChild(button);
            list.appendChild(row);
          }
          offset += data.items.length;
          total = Number.isInteger(data.total) ? data.total : offset;
          more.hidden = offset >= total || data.items.length === 0;
          more.textContent = "Load more songs";
          status.textContent = total === 0 ? "This playlist is empty." : "";
          enabled();
          highlight();
        } catch (error) {
          status.textContent = error.message;
          more.hidden = false;
          more.textContent = "Retry loading songs";
        } finally {
          loading = false;
          more.disabled = false;
        }
      }
      if (more) more.onclick = page;
      return {
        async load() {
          if (!match || !section) return;
          section.hidden = false;
          title.href = release;
          title.textContent = "Playlist";
          status.textContent = "Loading songs…";
          try {
            const metadata = await request(
              "playlists/" + match[1] + "?fields=name",
            );
            title.textContent = metadata.name || "Playlist";
          } catch {
            /* The song list can succeed even if the title is unavailable. */
          }
          await page();
        },
        ready(value) {
          ready = value;
          enabled();
        },
        current(id) {
          currentId = id;
          highlight();
        },
      };
    },
  };
})();
