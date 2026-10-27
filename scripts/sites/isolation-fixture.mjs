import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { fileURLToPath, pathToFileURL } from "node:url";
import { resolve } from "node:path";
import ts from "typescript";

const root = fileURLToPath(new URL("../../", import.meta.url));
const origin = "http://127.0.0.1:8848";
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
const loadRenderer = (bytes, name) => {
  const compiled = ts.transpileModule(bytes.toString(), {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText;
  const exports = {};
  new Function("exports", compiled)(exports);
  return exports[name];
};

/** Credential-free loopback fixture; snapshots source bytes at startup. */
export function createIsolationFixture(fixtureRoot = root) {
  const sources = [
    "lib/sites/renderExperience.ts",
    "lib/sites/renderSpotifyPlayer.ts",
    "public/sites-runtime.js",
    "public/sites-fan-runtime.js",
    "public/sites-player.css",
    "public/spotify-playlist.js",
    "public/syncstream/spotify.svg",
    "public/syncstream/fonts/Inter-Medium.ttf",
    "public/syncstream/fonts/CircularStd-Medium.ttf",
    "scripts/sites/hostile-game.js",
    "scripts/sites/isolation-fixture.mjs",
  ];
  const cache = new Map(
    sources.map((path) => [path, readFileSync(resolve(fixtureRoot, path))]),
  );
  const read = (path) => cache.get(path);
  const hashes = Object.fromEntries(
    sources.map((path) => [path, hash(read(path))]),
  );
  const render = loadRenderer(
    read("lib/sites/renderExperience.ts"),
    "renderExperience",
  );
  const player = loadRenderer(
    read("lib/sites/renderSpotifyPlayer.ts"),
    "renderSpotifyPlayer",
  );
  const site = {
    name: "Hostile-frame qualification",
    releaseUrl: "",
    assets: [],
    design: {
      headline: "Isolation fixture",
      eyebrow: "",
      description: "",
      buttonLabel: "",
      signupHeading: "",
      background: "#FFFFFF",
      foreground: "#152E37",
      accent: "#D6FF62",
      font: "sans",
      layout: "poster",
      experience: {
        html: '<h1>Generated game</h1><button id="advance">Advance game</button><p>Score: <b id="score">0</b></p><button id="run">Run hostile probes</button><button id="resize-max">Request huge resize</button><button id="resize-min">Request tiny resize</button><pre id="probe-results" aria-live="polite"></pre>',
        css: "body{padding:16px;font:16px system-ui}button{margin:4px;padding:12px}pre{white-space:pre-wrap}iframe{height:20px}",
        javascript: read("scripts/sites/hostile-game.js").toString(),
      },
    },
  };
  const shell = render(site, "/unused-signup", origin + "/player", {
    activityUrl: "/activity",
  });
  // Add observation-only harness controls outside the unchanged rendered shell/frame.
  const harness = `<section id="fixture-observer"><h2>Trusted fixture observer</h2><span id="credential-sentinel" hidden>synthetic-not-a-credential</span><button id="wrong-source">Send wrong-source messages</button><button id="inspect">Inspect evidence</button><pre id="evidence"></pre></section><script>
  sessionStorage.setItem('isolation-sentinel','synthetic-not-a-credential');
  document.getElementById('wrong-source').onclick=()=>{
    for(const data of [{type:'recoup:activity',event:'complete'},{type:'recoup:resize',height:9999},{type:'recoup:join'}])window.postMessage(data,location.origin);
  };
  document.getElementById('inspect').onclick=async()=>{
    const sink=await fetch('/evidence').then(r=>r.json());
    const game=document.getElementById('experience');
    document.getElementById('evidence').textContent=JSON.stringify({sink,frameHeight:game.style.height,entered:document.body.dataset.entered,inert:game.inert,musicExpanded:document.getElementById('music-toggle').getAttribute('aria-expanded'),sentinel:document.getElementById('credential-sentinel').textContent,viewport:[innerWidth,innerHeight]},null,2);
  };</script>`;
  const html = shell.replace("</body>", harness + "</body>");
  const playerHtml = player("", origin, null);
  const assets = Object.fromEntries(
    [
      "sites-runtime.js",
      "sites-fan-runtime.js",
      "sites-player.css",
      "spotify-playlist.js",
    ].map((name) => ["/" + name, read("public/" + name)]),
  );
  const responseHashes = {
    shell: hash(shell),
    harness: hash(harness),
    "/": hash(html),
    "/player": hash(playerHtml),
  };
  const events = [];
  const escapes = [];
  const server = createServer(async (req, res) => {
    const path = new URL(req.url, origin).pathname;
    res.setHeader("Cache-Control", "no-store");
    if (path === "/activity" && req.method === "POST") {
      let body = "";
      for await (const chunk of req) {
        body += chunk;
        if (body.length > 4096) {
          res.writeHead(413).end();
          return;
        }
      }
      try {
        events.push(JSON.parse(body));
      } catch {
        res.writeHead(400).end();
        return;
      }
      res.writeHead(204).end();
      return;
    }
    if (path.startsWith("/escape"))
      escapes.push({ method: req.method, url: req.url });
    const json =
      path === "/evidence"
        ? { events, escapes, hashes, responseHashes }
        : path === "/api/sites/spotify/config"
          ? { configured: false }
          : null;
    if (json) {
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify(json));
      return;
    }
    if (path === "/" || path === "/player") {
      res.setHeader("Content-Type", "text/html");
      res.end(path === "/" ? html : playerHtml);
      return;
    }
    if (assets[path]) {
      res.setHeader(
        "Content-Type",
        path.endsWith(".css") ? "text/css" : "text/javascript",
      );
      res.end(assets[path]);
      return;
    }
    // Only local static player assets; no proxying or external calls.
    if (
      /^\/syncstream\/(spotify\.svg|fonts\/(Inter-Medium|CircularStd-Medium)\.ttf)$/.test(
        path,
      )
    ) {
      res.setHeader(
        "Content-Type",
        path.endsWith(".svg") ? "image/svg+xml" : "font/ttf",
      );
      res.end(read("public" + path));
      return;
    }
    res.writeHead(404).end();
  });
  return { server, hashes, responseHashes, html, shell };
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
  const fixture = createIsolationFixture();
  fixture.server.listen(8848, "127.0.0.1", () =>
    process.stdout.write(
      JSON.stringify({
        origin,
        hashes: fixture.hashes,
        responseHashes: fixture.responseHashes,
      }) + "\n",
    ),
  );
}
