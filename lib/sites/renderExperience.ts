import type { SiteSnapshot } from "./schema";

/** Generated code only runs in an opaque-origin frame; trusted controls stay outside. */
export function renderExperience(
  site: SiteSnapshot,
  signupAction?: string,
  connectUrl?: string,
): string {
  const esc = (v: string) =>
    v.replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c]!,
    );
  const d = site.design;
  const e = d.experience!;
  let themedConnectUrl = connectUrl;
  if (connectUrl) {
    const url = new URL(connectUrl);
    for (const [key, value] of Object.entries({
      background: d.background,
      foreground: d.foreground,
      accent: d.accent,
      font: d.font,
      title: site.name,
      artwork: site.assets.find((asset) => asset.type === "image")?.url || "",
    }))
      url.searchParams.set(key, value);
    themedConnectUrl = url.href;
  }
  const assetOrigins = [
    ...new Set(site.assets.map((asset) => new URL(asset.url).origin)),
  ].join(" ");
  const child = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data: ${assetOrigins}; media-src ${assetOrigins || "'none'"}; connect-src 'none'; frame-src 'none'; form-action 'none'; base-uri 'none'"><style>html,body{margin:0;min-height:100%;box-sizing:border-box}*{box-sizing:border-box}${e.css.replace(/<\/style/gi, "<\\/style")}
</style></head><body>${e.html}<script>${e.javascript.replace(/<\/script/gi, "<\\/script")}</script></body></html>`;
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(site.name)}</title><style>
*{box-sizing:border-box}body{margin:0;background:${d.background};color:${d.foreground};font:15px/1.5 system-ui}header{line-height:24px;display:flex;align-items:center;justify-content:space-between;gap:16px;padding:16px 24px;border-bottom:1px solid #8884}header strong{font-size:16px}button,a{font:inherit}button{padding:10px 16px;border:0;border-radius:24px;cursor:pointer;background:${d.accent};color:#111}button:disabled{opacity:.5;cursor:default}a{color:inherit}.controls{display:flex;align-items:center;gap:10px;flex-wrap:wrap}#spotify-status{font-size:12px;max-width:300px}iframe{display:block;width:100%;height:80vh;min-height:480px;border:0}footer{padding:32px 24px;max-width:680px;margin:auto}input[type=email]{display:block;width:100%;padding:12px;margin:12px 0;background:transparent;color:inherit;border:1px solid #888;border-radius:8px}label{display:block;margin:12px 0}audio{max-width:100%}.hp{display:none}@media(max-width:640px){header{align-items:flex-start;flex-direction:column;padding:14px}iframe{height:75vh}}

[hidden]{display:none!important}body[data-preview="false"] header{display:none}.entrance{position:fixed;inset:0;z-index:20;background:rgb(9 13 23 / 48%);backdrop-filter:blur(6px)}.music-panel{position:fixed;right:39px;top:14px;width:375px;z-index:30;border-radius:12px;overflow:hidden;box-shadow:#dcdcdc 0 0 0 .5px inset,0 6px 10px #00000026;background:white;color:#1f1a1e}.music-panel iframe{height:260px;min-height:0;width:100%;border:0}.music-panel.collapsed{visibility:hidden;pointer-events:none;transform:translateX(calc(100% + 40px))}.music-toggle{position:fixed;right:0;top:50px;z-index:31;background:#171717;color:white;width:40px;height:40px;border-radius:6px 0 0 6px;padding:0;display:flex;align-items:center;justify-content:center;box-shadow:0 0 0 1px #ffffff14;transition:background .15s ease}.music-toggle:hover{background:#303030}.music-toggle:focus-visible{outline:2px solid white;outline-offset:3px}.music-toggle img{display:block;filter:invert(1);opacity:.9}.music-panel:not(.collapsed)~.music-toggle{display:none}#experience[inert]{pointer-events:none}@media(max-width:640px){.music-panel{top:auto;bottom:0;right:0;width:100%;border-radius:12px 12px 0 0}.music-panel.collapsed{transform:translateY(100%)}}
body:not([data-entered]) .music-panel{top:50%;left:50%;right:auto;bottom:auto;width:min(375px,calc(100% - 32px));border-radius:16px;transform:translate(-50%,-50%)}
</style></head><body data-sites-runtime data-theme-background="${d.background}" data-theme-foreground="${d.foreground}" data-theme-accent="${d.accent}" data-theme-font="${d.font}" data-theme-title="${esc(site.name)}" data-theme-artwork="${esc(site.assets.find((a) => a.type === "image")?.url || "")}" data-audio-url="${esc(site.assets.find((asset) => asset.type === "audio")?.url || "")}" data-connect-url="${esc(themedConnectUrl || "")}" data-preview="${!signupAction}" data-release="${esc(site.releaseUrl)}"><header><strong>${esc(site.name)}</strong><div class="controls"><button id="spotify-connect" type="button">Connect Spotify</button><button id="spotify-play" type="button" hidden>Play music</button><button id="spotify-disconnect" type="button" hidden>Disconnect</button><span id="spotify-track" hidden><img id="spotify-cover" width="40" height="40" alt=""><a id="spotify-track-link" target="_blank" rel="noopener noreferrer"></a></span><span id="spotify-status" role="status">${signupAction ? "Connect to listen while you play." : connectUrl ? "Test Spotify in a separate window. Your draft stays private." : "Spotify connects on your published site."}</span>${site.releaseUrl ? `<a href="${esc(site.releaseUrl)}" target="_blank" rel="noopener noreferrer">Open music ↗</a>` : ""}</div></header><iframe id="experience" title="${esc(site.name)} experience" sandbox="allow-scripts" srcdoc="${esc(child)}"></iframe>${signupAction ? `<div class="entrance" id="music-entrance"></div><aside class="music-panel" id="music-panel" aria-label="Music player"><iframe id="music-frame" title="Spotify player" allow="autoplay *; encrypted-media *" src="about:blank"></iframe></aside><button id="music-toggle" class="music-toggle" type="button" hidden aria-expanded="true" aria-label="Open music player"><img src="/syncstream/spotify.svg" width="20" height="20" alt=""></button>` : ""}<footer>${site.assets
    .filter((a) => a.type === "audio")
    .map(
      (a) =>
        `<p>${esc(a.name)}</p><audio controls src="${esc(a.url)}"></audio>`,
    )
    .join(
      "",
    )}<h2>${esc(d.signupHeading)}</h2>${signupAction ? `<form method="post" action="${esc(signupAction)}"><label for="email">Email address</label><input id="email" type="email" name="email" autocomplete="email" maxlength="254" required><div class="hp"><input name="website" tabindex="-1" autocomplete="off"></div><label><input type="checkbox" name="consent" value="yes" required> I agree to receive email updates from ${esc(site.name)}.</label><button>Sign up</button></form>` : "<p>Email signup is available after publishing.</p>"}</footer><script src="/sites-runtime.js" defer></script></body></html>`;
}
