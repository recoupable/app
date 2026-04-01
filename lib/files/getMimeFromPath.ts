const mimeByExt: Record<string, string> = {
  txt: "text/plain",
  log: "text/plain",
  md: "text/markdown",
  json: "application/json",
  csv: "text/csv",
  xml: "application/xml",
  yml: "application/x-yaml",
  yaml: "application/x-yaml",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  webp: "image/webp",
  svg: "image/svg+xml",
};

export const getMimeFromPath = (path: string): string => {
  const clean = (path || "").toLowerCase().split("?")[0];
  const ext = clean.includes(".") ? clean.split(".").pop() || "" : "";
  return (ext && mimeByExt[ext]) || "text/plain";
};

export default getMimeFromPath;
