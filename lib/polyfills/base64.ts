// Ensures global atob/btoa exist in Node for libraries that expect browser APIs
const g = globalThis as unknown as {
  atob?: (data: string) => string;
  btoa?: (data: string) => string;
};

if (typeof g.atob === "undefined") {
  g.atob = (data: string) => Buffer.from(data, "base64").toString("binary");
}

if (typeof g.btoa === "undefined") {
  g.btoa = (data: string) => Buffer.from(data, "binary").toString("base64");
}

export {}; // side-effect only
