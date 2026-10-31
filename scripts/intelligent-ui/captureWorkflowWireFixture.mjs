import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { parseArgs } from "node:util";
import { format } from "prettier";

// Only this pinned, already installed SDK may execute during regeneration.
// CI reads the captured bytes; it does not install or import the API SDK.
const expectedSdk = {
  version: "6.0.190",
  packageSha256:
    "24d5988d689a1becea98cc9f09ffb5356afdfae92c70aec880bd64ae94b8689c",
  entrySha256:
    "95a79e9ceea0e012c13a925e650d1ec72e50e41ba642553e3f7a2a3bf0ad3f7d",
};
const appRoot = fileURLToPath(new URL("../../", import.meta.url));
const fixtureRoot = path.join(
  appRoot,
  "lib/intelligent-ui/transport/__fixtures__/api-6.0.190",
);
const { values } = parseArgs({
  options: {
    "sdk-root": { type: "string" },
    output: { type: "string" },
  },
});
if (!values["sdk-root"])
  throw new Error(
    "Provide --sdk-root pointing to the installed ai@6.0.190 package.",
  );

const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");
const sdkRoot = path.resolve(values["sdk-root"]);
const packageBytes = await readFile(path.join(sdkRoot, "package.json"));
const sdkPackage = JSON.parse(packageBytes.toString("utf8"));
if (sdkPackage.name !== "ai" || sdkPackage.version !== expectedSdk.version)
  throw new Error("Serializer must be the exact ai@6.0.190 package.");
if (sha256(packageBytes) !== expectedSdk.packageSha256)
  throw new Error("Pinned serializer package.json hash does not match.");
const entry = "dist/index.mjs";
if (sdkPackage.exports?.["."]?.import !== `./${entry}`)
  throw new Error("Pinned serializer import entry does not match.");
const entryBytes = await readFile(path.join(sdkRoot, entry));
if (sha256(entryBytes) !== expectedSdk.entrySha256)
  throw new Error("Pinned serializer entry hash does not match.");

// Version and byte checks intentionally precede evaluating the supplied package.
const { createUIMessageStreamResponse } = await import(
  pathToFileURL(path.join(sdkRoot, entry)).href
);
const inputBytes = await readFile(path.join(fixtureRoot, "input.json"));
const input = JSON.parse(inputBytes.toString("utf8"));
const response = createUIMessageStreamResponse({
  stream: new ReadableStream({
    start(controller) {
      for (const chunk of input.chunks) controller.enqueue(chunk);
      controller.close();
    },
  }),
  headers: input.responseHeaders,
});
const streamBytes = Buffer.from(await response.arrayBuffer());
const recordEndOffsets = [];
let offset = 0;
while (offset < streamBytes.length) {
  const end = streamBytes.indexOf("\n\n", offset);
  if (end < 0)
    throw new Error("Serializer emitted an unterminated SSE record.");
  offset = end + 2;
  recordEndOffsets.push(offset);
}
const appPackage = JSON.parse(
  await readFile(path.join(appRoot, "package.json"), "utf8"),
);
const manifest = {
  schemaVersion: 1,
  kind: "offline-sdk-serializer-capture",
  producerSource: {
    repository: "recoupable/api",
    commit: "2dbf74288d9bc5a205632c1fc52fc4a18855c3ff",
    tree: "063a57232e58ce7ec5116b3568201246bd311151",
    declaredAiVersion: expectedSdk.version,
    execution: "Installed SDK serializer only; API application not executed.",
  },
  serializer: {
    package: "ai",
    version: sdkPackage.version,
    export: "createUIMessageStreamResponse",
    packageJson: { path: "package.json", sha256: sha256(packageBytes) },
    entry: { path: entry, sha256: sha256(entryBytes) },
  },
  consumerSource: {
    repository: "recoupable/app",
    baseCommit: "e47ea721aefe8f404402f39c8407dc0fd075cacb",
    declaredVersions: Object.fromEntries(
      ["ai", "@ai-sdk/react", "@workflow/ai"].map((name) => [
        name,
        appPackage.dependencies[name],
      ]),
    ),
  },
  input: {
    path: "input.json",
    bytes: inputBytes.length,
    sha256: sha256(inputBytes),
    chunkCount: input.chunks.length,
  },
  stream: {
    path: "stream.sse",
    bytes: streamBytes.length,
    sha256: sha256(streamBytes),
    recordCount: recordEndOffsets.length,
    recordEndOffsets,
    terminalRecord: "data: [DONE]\n\n",
  },
  response: {
    status: response.status,
    headers: Object.fromEntries(response.headers),
  },
};
const outputRoot = path.resolve(values.output ?? fixtureRoot);
await mkdir(outputRoot, { recursive: true });
await writeFile(path.join(outputRoot, "input.json"), inputBytes);
await writeFile(path.join(outputRoot, "stream.sse"), streamBytes);
await writeFile(
  path.join(outputRoot, "manifest.json"),
  await format(JSON.stringify(manifest), { parser: "json" }),
);
process.stdout.write(
  `Captured ${input.chunks.length} chunks / ${recordEndOffsets.length} SSE records / ${streamBytes.length} bytes; SHA-256 ${manifest.stream.sha256}\n`,
);
