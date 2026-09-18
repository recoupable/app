import type { SiteSnapshot } from "./schema";

/** Generated content stays data: the shared renderer owns markup and fan forms. */
export function renderSite(site: SiteSnapshot, signupAction?: string): string {
  const esc = (value: string) =>
    value.replace(
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
  const { design: d } = site;
  const artwork = site.assets.find((a) => a.type === "image");
  const tracks = site.assets.filter((a) => a.type === "audio");
  const gallery = site.assets.filter((a) => a.type === "image").slice(1);
  const consent = `I agree to receive email updates from ${site.name}.`;
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${esc(site.name)}</title><meta name="description" content="${esc(d.description)}"><style>
*{box-sizing:border-box}body{margin:0;background:${d.background};color:${d.foreground};font:16px/1.6 ${d.font === "serif" ? "Georgia,serif" : "system-ui,sans-serif"}}
a{color:inherit}button,input{font:inherit}header{padding:24px 6vw;font:12px system-ui;letter-spacing:.15em;text-transform:uppercase;border-bottom:1px solid color-mix(in srgb,currentColor 20%,transparent)}
main{max-width:1440px;margin:auto;padding:6vw;min-height:80vh;display:grid;gap:5vw;align-items:center}.split{grid-template-columns:1fr 1fr}.editorial{grid-template-columns:1.2fr 1fr}.poster{text-align:center;max-width:960px}.poster figure{order:-1;max-width:520px;margin:auto}
figure{margin:0;width:100%}img{display:block;width:100%;height:auto;max-height:72vh;object-fit:cover}.placeholder{aspect-ratio:1;background:linear-gradient(135deg,${d.accent},${d.background});display:grid;place-items:center;font-size:clamp(64px,12vw,180px)}
.eyebrow{font:12px system-ui;letter-spacing:.2em;text-transform:uppercase}h1{font-size:clamp(46px,7vw,110px);letter-spacing:-.055em;line-height:.98;font-weight:500;margin:28px 0}p{max-width:52ch;white-space:pre-line;opacity:.85}.poster p{margin-left:auto;margin-right:auto}
.listen,button{display:inline-flex;justify-content:center;padding:14px 24px;border:0;border-radius:4px;background:${d.accent};color:#111;font:600 14px system-ui;text-decoration:none;cursor:pointer}.listen{margin:20px 0}audio{width:100%;margin-top:24px}section{padding:40px 6vw 64px;border-top:1px solid color-mix(in srgb,currentColor 20%,transparent)}.signup{max-width:640px;margin:auto}h2{font-size:30px;line-height:1.2}input[type=email]{width:100%;padding:14px;background:transparent;color:inherit;border:1px solid currentColor;border-radius:4px}label{display:block;margin:16px 0;font:14px/1.5 system-ui}input[type=checkbox]{margin-right:8px}footer{padding:24px 6vw;font:12px system-ui;opacity:.7}.hp{position:absolute;left:-10000px}button:focus-visible,a:focus-visible,input:focus-visible{outline:3px solid ${d.accent};outline-offset:4px}@media(max-width:700px){.split,.editorial{grid-template-columns:1fr}main{padding:32px 6vw;gap:32px}figure{order:-1}img{max-height:55vh}h1{font-size:clamp(44px,12vw,72px)}}
</style></head><body><header>${esc(site.name)}</header><main class="${d.layout}"><div><span class="eyebrow">${esc(d.eyebrow)}</span><h1>${esc(d.headline)}</h1><p>${esc(d.description)}</p>${site.releaseUrl ? `<a class="listen" href="${esc(site.releaseUrl)}" target="_blank" rel="noopener noreferrer">${esc(d.buttonLabel || "Listen")}</a>` : ""}${tracks.map((audio) => `<div><p>${esc(audio.name)}</p><audio controls preload="none" src="${esc(audio.url)}">Your browser does not support audio playback.</audio></div>`).join("")}</div><figure>${artwork ? `<img src="${esc(artwork.url)}" alt="${esc(site.name)} artwork">` : `<div class="placeholder" aria-hidden="true">${esc(site.name.slice(0, 1))}</div>`}</figure></main>${gallery.length ? `<section style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:24px">${gallery.map((a) => `<img loading="lazy" src="${esc(a.url)}" alt="${esc(a.name)}">`).join("")}</section>` : ""}<section><div class="signup"><h2>${esc(d.signupHeading)}</h2>${signupAction ? `<form method="post" action="${esc(signupAction)}"><label for="email">Email address</label><input id="email" name="email" type="email" autocomplete="email" maxlength="254" required><div class="hp" aria-hidden="true"><label>Leave empty<input name="website" tabindex="-1" autocomplete="off"></label></div><label><input name="consent" value="yes" type="checkbox" required>${esc(consent)}</label><button type="submit">Sign up</button></form>` : "<p>Email signup will be available on your published site.</p>"}</div></section><footer>Made with Recoup</footer></body></html>`;
}
