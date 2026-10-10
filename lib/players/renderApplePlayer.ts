import type { PlayerConfig } from "./getPlayerConfig";
import { escapePlayerHtml as escape } from "./escapePlayerHtml";
export function renderApplePlayer(config: PlayerConfig, parent: string) {
  const release = new URL(config.appleUrl!),
    match = /\/[a-z]{2}\/(album|song)\/[^/]+\/(\d+)$/.exec(release.pathname);
  if (!match || release.hostname !== "music.apple.com")
    throw new Error("Invalid Apple release");
  const song = release.searchParams.get("i");
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escape(config.name)} · Recoup</title><link rel="stylesheet" href="/sites-player.css"></head><body data-apple-player data-player-config="${escape(JSON.stringify(config))}" data-player-id="${config.playerId}" data-player-parent="${escape(parent)}" data-release-kind="${song ? "song" : match[1]}" data-release-id="${song || match[2]}"><main id="syncstream-player"><header class="sign-header"><span>Apple Music</span></header><section class="sign-body"><h1>${escape(config.name)}</h1><p class="sign-description">Sign in to listen here with your Apple Music subscription. Recoup records listening activity in this player.</p><button id="apple-connect" class="sign-button" disabled>Sign in with Apple</button><div id="apple-controls" hidden><button id="apple-previous" class="player-link">Previous</button><button id="apple-play" class="sign-button">Play</button><button id="apple-next" class="player-link">Next</button><p id="apple-track"></p><button id="apple-disconnect" class="player-link">Disconnect</button></div><p id="apple-status" role="status">Preparing Apple Music…</p></section><footer><a class="player-link" href="${escape(config.appleUrl!)}" target="_blank" rel="noopener noreferrer">Open in Apple Music</a></footer></main><script src="/release-player-runtime.js" defer></script><script src="/sites-apple-runtime.js" defer></script></body></html>`;
}
