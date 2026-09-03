import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { downloadMedia } from "@/lib/chat/downloadMedia";

const anchors: {
  href: string;
  download: string;
  click: ReturnType<typeof vi.fn>;
}[] = [];

beforeEach(() => {
  anchors.length = 0;

  vi.stubGlobal("document", {
    createElement: () => {
      const anchor = { href: "", download: "", click: vi.fn() };
      anchors.push(anchor);
      return anchor;
    },
    body: { appendChild: vi.fn(), removeChild: vi.fn() },
  });

  vi.stubGlobal("URL", {
    createObjectURL: vi.fn(() => "blob:mock-object-url"),
    revokeObjectURL: vi.fn(),
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("downloadMedia", () => {
  it("fetches the asset and saves it through an object url", async () => {
    const blob = new Blob(["x"]);
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, blob: async () => blob }),
    );

    await downloadMedia(
      "https://v3b.fal.media/files/b/abc/clip.mp4",
      "clip.mp4",
    );

    // The `download` attribute alone is ignored cross-origin, and fal.media
    // does not honour Supabase's `?download=` parameter — the blob is what
    // actually makes the button download rather than navigate.
    expect(URL.createObjectURL).toHaveBeenCalledWith(blob);
    expect(anchors[0]?.href).toBe("blob:mock-object-url");
    expect(anchors[0]?.download).toBe("clip.mp4");
    expect(anchors[0]?.click).toHaveBeenCalled();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:mock-object-url");
  });

  it("falls back to the direct url when the fetch fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("cors")));

    await downloadMedia("https://cdn.example.com/clip.mp4", "clip.mp4");

    expect(anchors[0]?.href).toBe("https://cdn.example.com/clip.mp4");
    expect(anchors[0]?.click).toHaveBeenCalled();
  });

  it("falls back on a non-ok response rather than saving an error page", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, blob: async () => new Blob() }),
    );

    await downloadMedia("https://cdn.example.com/clip.mp4", "clip.mp4");

    expect(URL.createObjectURL).not.toHaveBeenCalled();
    expect(anchors[0]?.href).toBe("https://cdn.example.com/clip.mp4");
  });
});
