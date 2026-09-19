"use client";
import Link from "next/link";
import Image from "next/image";
import { usePrivy } from "@privy-io/react-auth";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Upload, X, Loader2 } from "lucide-react";
import { useOrganization } from "@/providers/OrganizationProvider";
import { useArtistProvider } from "@/providers/ArtistProvider";
import { useSitesRequest } from "@/hooks/useSitesRequest";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Site, SiteAsset } from "@/lib/sites/schema";
export default function CreateSite() {
  const { selectedOrgId, isInitialized } = useOrganization();
  const { selectedArtist } = useArtistProvider();
  const { ready, authenticated } = usePrivy();
  if (!ready || !authenticated || !isInitialized)
    return (
      <p role="status" className="p-10 text-muted-foreground">
        {ready && !authenticated
          ? "Sign in to Recoup to continue."
          : "Loading your workspace…"}
      </p>
    );
  return (
    <CreateForm
      key={`${selectedOrgId}:${selectedArtist?.account_id}`}
      organizationId={selectedOrgId}
      artistId={selectedArtist?.account_id ?? null}
      artistName={selectedArtist?.name ?? undefined}
    />
  );
}
function CreateForm({
  organizationId,
  artistId,
  artistName,
}: {
  organizationId: string | null;
  artistId: string | null;
  artistName?: string;
}) {
  const [name, setName] = useState(artistName || "");
  const [brief, setBrief] = useState("");
  const [releaseUrl, setReleaseUrl] = useState("");
  const [assets, setAssets] = useState<SiteAsset[]>([]);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const request = useSitesRequest();
  const router = useRouter();
  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    setError("");
    try {
      for (const file of Array.from(files).slice(0, 8 - assets.length)) {
        if (file.size > 4 * 1024 * 1024)
          throw new Error("Choose files under 4 MB each.");
        const body = new FormData();
        body.append("file", file);
        const result = await request<{ asset: SiteAsset }>(
          `/api/sites/assets${organizationId ? `?organizationId=${organizationId}` : ""}`,
          { method: "POST", body },
        );
        setAssets((old) => [...old, result.asset]);
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setUploading(false);
    }
  }
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const { site } = await request<{ site: Site }>("/api/sites", {
        method: "POST",
        body: JSON.stringify({
          organizationId,
          artistId,
          name,
          brief,
          releaseUrl,
          assets,
        }),
      });
      try {
        await request(`/api/sites/${site.id}`, {
          method: "PATCH",
          body: JSON.stringify({
            action: "generate",
            revision: site.revision,
            instruction: brief,
          }),
        });
      } catch {
        router.push(`/sites/${site.id}?generationFailed=1`);
        return;
      }
      router.push(`/sites/${site.id}`);
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  }
  return (
    <div className="mx-auto max-w-5xl px-6 py-10 md:px-10">
      <Link
        href="/sites"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground"
      >
        <ArrowLeft size={14} />
        Sites
      </Link>
      <div className="mt-10 grid gap-12 md:grid-cols-[.8fr_1.2fr]">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Create site
          </p>
          <h1 className="mt-4 text-4xl font-medium leading-tight tracking-tight">
            Start with
            <br />
            an idea.
          </h1>
          <p className="mt-5 max-w-xs text-sm leading-6 text-muted-foreground">
            A release page, an artist website, a place for fans to listen. Tell
            us what you have in mind.
          </p>
          <div className="mt-8 space-y-4 text-sm text-muted-foreground">
            <p>
              01 <span className="ml-3">Add your brief and assets</span>
            </p>
            <p>
              02 <span className="ml-3">Generate and refine the design</span>
            </p>
            <p>
              03 <span className="ml-3">Publish when you’re ready</span>
            </p>
          </div>
        </div>
        <form onSubmit={submit}>
          <fieldset disabled={busy} className="space-y-6">
            <div>
              <label
                htmlFor="site-name"
                className="mb-2 block text-sm font-medium"
              >
                Site name
              </label>
              <Input
                id="site-name"
                required
                maxLength={120}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Artist or release name"
              />
            </div>
            <div>
              <label
                htmlFor="site-link"
                className="mb-2 block text-sm font-medium"
              >
                Music link{" "}
                <span className="font-normal text-muted-foreground">
                  · Optional
                </span>
              </label>
              <Input
                id="site-link"
                type="url"
                value={releaseUrl}
                onChange={(e) => setReleaseUrl(e.target.value)}
                placeholder="https://open.spotify.com/album/…"
              />
              <p className="mt-2 text-xs text-muted-foreground">
                Fans can open this link from your site.
              </p>
            </div>
            <div>
              <label
                htmlFor="site-brief"
                className="mb-2 block text-sm font-medium"
              >
                What do you want to make?
              </label>
              <Textarea
                id="site-brief"
                required
                maxLength={6000}
                rows={5}
                value={brief}
                onChange={(e) => setBrief(e.target.value)}
                placeholder="A minimal release page. Oversized artwork, warm cream background, a listen button, and email signup. The album is called…"
              />
            </div>
            <div>
              <label
                htmlFor="site-assets"
                className="mb-2 block text-sm font-medium"
              >
                Artwork and audio{" "}
                <span className="font-normal text-muted-foreground">
                  · Optional
                </span>
              </label>
              <label className="flex cursor-pointer items-center gap-3 rounded-xl bg-muted/40 p-5 shadow-[0_0_0_1px_var(--border)]">
                <Upload size={18} />
                <span className="text-sm">
                  {uploading ? "Uploading…" : "Choose files"}
                </span>
                <input
                  id="site-assets"
                  type="file"
                  className="sr-only"
                  multiple
                  accept="image/jpeg,image/png,image/webp,audio/mpeg,audio/wav"
                  disabled={busy || uploading || assets.length >= 8}
                  onChange={(e) => {
                    void upload(e.target.files);
                    e.target.value = "";
                  }}
                />
              </label>
              <p className="mt-2 text-xs leading-5 text-muted-foreground">
                JPG, PNG, WebP, MP3 or WAV. Up to 8 files, 4 MB each. Upload
                only assets you can share publicly. The first image is your
                cover; additional images appear in a gallery.
              </p>
              {assets.map((asset, i) => (
                <div
                  key={asset.url}
                  className="mt-3 flex items-center gap-3 text-sm"
                >
                  {asset.type === "image" && (
                    <Image
                      unoptimized
                      width={36}
                      height={36}
                      src={asset.url}
                      alt=""
                      className="h-9 w-9 rounded object-cover"
                    />
                  )}
                  <span className="min-w-0 flex-1 truncate">{asset.name}</span>
                  <button
                    type="button"
                    aria-label={`Remove ${asset.name}`}
                    onClick={() =>
                      setAssets((a) => a.filter((_, index) => index !== i))
                    }
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}
            <Button
              className="w-full"
              disabled={busy || uploading}
              type="submit"
            >
              {busy ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <ArrowRight size={16} />
              )}
              {busy ? "Designing your site…" : "Generate site"}
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Your site stays private until you publish it.
            </p>
          </fieldset>
        </form>
      </div>
    </div>
  );
}
