import { createHash } from "node:crypto";
import {
  copyFileSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { Readable } from "node:stream";
import { expect, it } from "vitest";
import { createIsolationFixture } from "../isolation-fixture.mjs";

it("serves and hashes frozen bytes after the source tree changes", async () => {
  const dir = mkdtempSync(join(tmpdir(), "sites-isolation-"));
  const baseline = createIsolationFixture();
  const hash = (bytes: string | Buffer) =>
    createHash("sha256").update(bytes).digest("hex");
  try {
    for (const path of Object.keys(baseline.hashes)) {
      mkdirSync(dirname(join(dir, path)), { recursive: true });
      copyFileSync(path, join(dir, path));
    }
    const fixture = createIsolationFixture(dir);
    const request = (url: string) =>
      new Promise<Buffer>((resolve) => {
        const req = Object.assign(Readable.from([]), { url, method: "GET" });
        const res = {
          setHeader: () => {},
          writeHead: () => res,
          end: (body: string | Buffer) => resolve(Buffer.from(body)),
        };
        fixture.server.emit("request", req, res);
      });
    const originalRuntime = readFileSync(join(dir, "public/sites-runtime.js"));
    // Change every captured file, including both renderers and static player assets.
    for (const path of Object.keys(fixture.hashes))
      writeFileSync(join(dir, path), "changed after startup");
    expect((await request("/")).toString()).toBe(fixture.html);
    expect(hash(await request("/"))).toBe(fixture.responseHashes["/"]);
    expect(hash(await request("/player"))).toBe(
      fixture.responseHashes["/player"],
    );
    expect(hash(fixture.shell)).toBe(fixture.responseHashes.shell);
    expect(await request("/sites-runtime.js")).toEqual(originalRuntime);
    for (const path of Object.keys(fixture.hashes).filter((path) =>
      path.startsWith("public/"),
    )) {
      expect(hash(await request(path.slice("public".length)))).toBe(
        fixture.hashes[path],
      );
    }
    const evidence = JSON.parse((await request("/evidence")).toString());
    expect(evidence.hashes).toEqual(baseline.hashes);
    expect(evidence.responseHashes).toEqual(baseline.responseHashes);
    fixture.server.close();
  } finally {
    baseline.server.close();
    rmSync(dir, { recursive: true, force: true });
  }
});
