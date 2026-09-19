/** Trusted player markup, matching the original SyncStream OneTap layout. Inputs are escaped by the route. */
export function renderSpotifyPlayer(
  release: string,
  parent: string,
  audioUrl: string | null,
): string {
  const icon = (path: string, size = 20) =>
    `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="${path}"/></svg>`;
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Spotify · Recoup</title><link rel="stylesheet" href="/sites-player.css"></head><body data-sites-runtime data-spotify-player="true" data-player-parent="${parent}" data-release="${release}"><main id="syncstream-player">
  <header class="sign-header"><span><img src="/syncstream/spotify.svg" alt="Spotify" width="20" height="20">Connect Spotify</span><button id="spotify-minimize" class="close" aria-label="Minimize player">${icon("M6.4 5 12 10.6 17.6 5 19 6.4 13.4 12 19 17.6 17.6 19 12 13.4 6.4 19 5 17.6 10.6 12 5 6.4Z")}</button></header>
  <section class="sign-body"><button id="spotify-connect" class="sign-button">Continue</button><button id="spotify-continue" class="sign-button" hidden>Continue</button><p class="terms">Recoup receives your Spotify profile and email. <a href="https://recoupable.dev/privacy" target="_blank" rel="noopener noreferrer">Privacy</a> · <a href="https://recoupable.dev/terms" target="_blank" rel="noopener noreferrer">Terms</a>.</p></section>
  <section id="player-display" hidden>
    <div class="artist-banner"><img id="spotify-artist-image" alt=""><div class="banner-shade"></div><strong id="spotify-artist-name">Spotify</strong><button id="spotify-player-minimize" aria-label="Minimize player" class="banner-minimize">${icon("M6 5h13v13h-2V8.4L5.7 19.7l-1.4-1.4L15.6 7H6Z", 16)}</button></div>
    <div id="spotify-track" class="track-row" hidden><img id="spotify-cover" width="30" height="30" alt=""><a id="spotify-track-link" target="_blank" rel="noopener noreferrer"></a><span id="spotify-duration">0:00</span></div>
    <section id="spotify-controls" class="playback"><div class="playback-main"><div class="transport"><button id="spotify-previous" aria-label="Previous track">${icon("M6 5h2v14H6zm12 0v14L8 12Z", 15)}</button><button id="spotify-play" aria-label="Play music" hidden disabled><svg class="play-icon" width="25" height="25" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="currentColor"/><path d="m10 7 7 5-7 5Z" fill="black"/></svg><svg class="pause-icon" width="25" height="25" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6 4h4v16H6zm8 0h4v16h-4z"/></svg></button><button id="spotify-next" aria-label="Next track">${icon("M16 5h2v14h-2zM6 5l10 7-10 7Z", 15)}</button></div><div class="progress"><span id="spotify-position">0:00</span><input id="spotify-seek" type="range" min="0" max="100" value="0" aria-label="Track position"><span id="spotify-time">0:00</span></div></div><label class="volume" aria-label="Volume">${icon("M3 9v6h4l5 4V5L7 9H3zm12-3v2a5 5 0 0 1 0 8v2a7 7 0 0 0 0-12z", 16)}<input id="spotify-volume" type="range" min="0" max="100" value="70" aria-label="Volume"></label></section>
  </section>
  ${audioUrl ? `<section id="audio-fallback" hidden><p>Listen to the artist-provided audio</p><audio controls preload="none" src="${audioUrl}"></audio></section>` : ""}
  <p id="spotify-status" role="status" hidden></p><footer><button id="spotify-skip">Continue without music</button><a class="player-link" href="${release}" target="_blank" rel="noopener noreferrer">Open in Spotify</a><button id="spotify-disconnect" class="player-link" hidden>Disconnect</button></footer>
  </main><script src="/sites-runtime.js" defer></script></body></html>`;
}
