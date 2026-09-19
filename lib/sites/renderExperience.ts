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
  const assetOrigins = [
    ...new Set(site.assets.map((asset) => new URL(asset.url).origin)),
  ].join(" ");
  const child = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data: ${assetOrigins}; media-src ${assetOrigins || "'none'"}; connect-src 'none'; frame-src 'none'; form-action 'none'; base-uri 'none'"><style>html,body{margin:0;min-height:100%;box-sizing:border-box}*{box-sizing:border-box}${e.css.replace(/<\/style/gi, "<\\/style")}
[hidden]{display:none!important}body[data-preview="false"] header{display:none}.entrance{position:fixed;inset:0;z-index:20;background:#09111b66;backdrop-filter:blur(8px);display:grid;place-items:center;padding:24px}.entrance-card{position:absolute;left:24px;top:24px;align-self:center;text-align:center;max-width:400px;padding:12px;border-radius:20px;background:transparent;color:white;box-shadow:0 20px 80px #0005}.entrance-card h1{font-size:32px;letter-spacing:-1px;margin:0 0 8px}.entrance-card p{color:#cad0d9}.music-panel{position:fixed;right:24px;top:24px;width:360px;z-index:30;border-radius:18px;overflow:hidden;box-shadow:0 8px 40px #0004;background:#fff;color:#18323a}.music-panel iframe{height:430px;min-height:0;width:100%;border:0}.music-toggle{position:fixed;right:24px;bottom:24px;z-index:31;background:#fff;color:#18323a;box-shadow:0 2px 16px #0003}body:not([data-entered]) .music-panel{top:50%;left:50%;right:auto;transform:translate(-50%,-50%)}.music-panel.collapsed{display:none}#experience[inert]{pointer-events:none}@media(max-width:640px){.music-panel{top:auto;bottom:0;right:0;width:100%;border-radius:20px 20px 0 0}.music-panel iframe{height:390px}.entrance-card{top:12px;left:12px;margin:0;padding:8px}.entrance-card h1{font-size:22px}body:not([data-entered]) .music-panel{top:auto;left:0;bottom:0;transform:none}.music-toggle{bottom:12px;right:12px}}
</style></head><body>${e.html}<script>${e.javascript.replace(/<\/script/gi, "<\\/script")}</script></body></html>`;
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(site.name)}</title><style>
*{box-sizing:border-box}body{margin:0;background:${d.background};color:${d.foreground};font:15px/1.5 system-ui}header{line-height:24px;display:flex;align-items:center;justify-content:space-between;gap:16px;padding:16px 24px;border-bottom:1px solid #8884}header strong{font-size:16px}button,a{font:inherit}button{padding:10px 16px;border:0;border-radius:24px;cursor:pointer;background:${d.accent};color:#111}button:disabled{opacity:.5;cursor:default}a{color:inherit}.controls{display:flex;align-items:center;gap:10px;flex-wrap:wrap}#spotify-status{font-size:12px;max-width:300px}iframe{display:block;width:100%;height:80vh;min-height:480px;border:0}footer{padding:32px 24px;max-width:680px;margin:auto}input[type=email]{display:block;width:100%;padding:12px;margin:12px 0;background:transparent;color:inherit;border:1px solid #888;border-radius:8px}label{display:block;margin:12px 0}audio{max-width:100%}.hp{display:none}@media(max-width:640px){header{align-items:flex-start;flex-direction:column;padding:14px}iframe{height:75vh}}

[hidden]{display:none!important}body[data-preview="false"] header{display:none}.entrance{position:fixed;inset:0;z-index:20;background:#09111b66;backdrop-filter:blur(8px);display:grid;place-items:center;padding:24px}.entrance-card{position:absolute;left:24px;top:24px;align-self:center;text-align:center;max-width:400px;padding:12px;border-radius:20px;background:transparent;color:white;box-shadow:0 20px 80px #0005}.entrance-card h1{font-size:32px;letter-spacing:-1px;margin:0 0 8px}.entrance-card p{color:#cad0d9}.music-panel{position:fixed;right:24px;top:24px;width:360px;z-index:30;border-radius:18px;overflow:hidden;box-shadow:0 8px 40px #0004;background:#fff;color:#18323a}.music-panel iframe{height:430px;min-height:0;width:100%;border:0}.music-toggle{position:fixed;right:24px;bottom:24px;z-index:31;background:#fff;color:#18323a;box-shadow:0 2px 16px #0003}body:not([data-entered]) .music-panel{top:50%;left:50%;right:auto;transform:translate(-50%,-50%)}.music-panel.collapsed{display:none}#experience[inert]{pointer-events:none}@media(max-width:640px){.music-panel{top:auto;bottom:0;right:0;width:100%;border-radius:20px 20px 0 0}.music-panel iframe{height:390px}.entrance-card{top:12px;left:12px;margin:0;padding:8px}.entrance-card h1{font-size:22px}body:not([data-entered]) .music-panel{top:auto;left:0;bottom:0;transform:none}.music-toggle{bottom:12px;right:12px}}
</style></head><body data-sites-runtime data-audio-url="${esc(site.assets.find((asset) => asset.type === "audio")?.url || "")}" data-connect-url="${esc(connectUrl || "")}" data-preview="${!signupAction}" data-release="${esc(site.releaseUrl)}"><header><strong>${esc(site.name)}</strong><div class="controls"><button id="spotify-connect" type="button">Connect Spotify</button><button id="spotify-play" type="button" hidden>Play music</button><button id="spotify-disconnect" type="button" hidden>Disconnect</button><span id="spotify-track" hidden><img id="spotify-cover" width="40" height="40" alt=""><a id="spotify-track-link" target="_blank" rel="noopener noreferrer"></a></span><span id="spotify-status" role="status">${signupAction ? "Connect to listen while you play." : connectUrl ? "Test Spotify in a separate window. Your draft stays private." : "Spotify connects on your published site."}</span>${site.releaseUrl ? `<a href="${esc(site.releaseUrl)}" target="_blank" rel="noopener noreferrer">Open music ↗</a>` : ""}</div></header><iframe id="experience" title="${esc(site.name)} experience" sandbox="allow-scripts" srcdoc="${esc(child)}"></iframe>${signupAction ? `<div class="entrance" id="music-entrance"><div class="entrance-card"><h1>${esc(site.name)}</h1><button id="experience-continue" type="button">Continue without music</button></div></div><aside class="music-panel" id="music-panel" aria-label="Music player"><iframe id="music-frame" title="Spotify player" allow="autoplay *; encrypted-media *" src="about:blank"></iframe></aside><button id="music-toggle" class="music-toggle" type="button" hidden aria-expanded="true">Minimize player</button>` : ""}<footer>${site.assets
    .filter((a) => a.type === "audio")
    .map(
      (a) =>
        `<p>${esc(a.name)}</p><audio controls src="${esc(a.url)}"></audio>`,
    )
    .join(
      "",
    )}<h2>${esc(d.signupHeading)}</h2>${signupAction ? `<form method="post" action="${esc(signupAction)}"><label for="email">Email address</label><input id="email" type="email" name="email" autocomplete="email" maxlength="254" required><div class="hp"><input name="website" tabindex="-1" autocomplete="off"></div><label><input type="checkbox" name="consent" value="yes" required> I agree to receive email updates from ${esc(site.name)}.</label><button>Sign up</button></form>` : "<p>Email signup is available after publishing.</p>"}</footer><script src="/sites-runtime.js" defer></script></body></html>`;
}
