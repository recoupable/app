"use client";
import Link from "next/link";
import Image from "next/image";
import { usePrivy } from "@privy-io/react-auth";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Paperclip, X, Loader2 } from "lucide-react";
import { useOrganization } from "@/providers/OrganizationProvider";
import { useArtistProvider } from "@/providers/ArtistProvider";
import { useSitesRequest } from "@/hooks/useSitesRequest";
import { Button } from "@/components/ui/button";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
  PromptInputSubmit,
} from "@/components/ai-elements/prompt-input";
import { parseSitePrompt } from "@/lib/sites/parseSitePrompt";
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
    />
  );
}
function CreateForm({
  organizationId,
  artistId,
}: {
  organizationId: string | null;
  artistId: string | null;
}) {
  const [message, setMessage] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);
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
    if (busy || uploading || !message.trim()) return;
    setError("");
    try {
      const { releaseUrl, brief } = parseSitePrompt(message);
      setBusy(true);
      const { site } = await request<{ site: Site }>("/api/sites", {
        method: "POST",
        body: JSON.stringify({
          organizationId,
          artistId,
          name: "",
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
            instruction: brief || site.brief,
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
    <div className="mx-auto flex min-h-[70dvh] w-full max-w-3xl flex-col px-6 py-8">
      <Link
        href="/sites"
        className="inline-flex w-fit items-center gap-2 text-sm text-muted-foreground"
      >
        <ArrowLeft size={14} /> Sites
      </Link>
      <div className="my-auto py-16">
        <h1 className="mb-8 text-center text-3xl font-medium tracking-tight">
          What would you like to make?
        </h1>
        <PromptInput
          onSubmit={submit}
          aria-busy={busy}
          className="rounded-2xl border-0 bg-card shadow-[0_0_0_1px_var(--input),0_6px_24px_var(--surface-shadow)] focus-within:ring-2 focus-within:ring-ring"
        >
          {assets.length > 0 && (
            <div className="flex flex-wrap gap-2 px-4 pt-4">
              {assets.map((asset, i) => (
                <div
                  key={asset.url}
                  className="flex max-w-full items-center gap-2 rounded-lg bg-muted px-3 py-2 text-xs"
                >
                  {asset.type === "image" && (
                    <Image
                      unoptimized
                      width={28}
                      height={28}
                      src={asset.url}
                      alt=""
                      className="h-7 w-7 rounded object-cover"
                    />
                  )}
                  <span className="max-w-48 truncate">{asset.name}</span>
                  <button
                    type="button"
                    disabled={busy}
                    aria-label={`Remove ${asset.name}`}
                    onClick={() =>
                      setAssets((a) => a.filter((_, index) => index !== i))
                    }
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
          <PromptInputTextarea
            aria-label="Describe your site and paste a Spotify link"
            placeholder="Paste a Spotify link and tell us what you have in mind…"
            value={message}
            maxLength={7000}
            minHeight={100}
            maxHeight={240}
            disabled={busy}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (
                e.key === "Enter" &&
                !e.shiftKey &&
                !e.nativeEvent.isComposing
              ) {
                e.preventDefault();
                e.currentTarget.form?.requestSubmit();
              }
            }}
          />
          <PromptInputToolbar className="px-3 py-2">
            <PromptInputTools>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Attach artwork or audio"
                title="Attach artwork or audio"
                disabled={busy || uploading || assets.length >= 8}
                onClick={() => fileInput.current?.click()}
              >
                {uploading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Paperclip size={18} />
                )}
              </Button>
              <input
                ref={fileInput}
                type="file"
                className="hidden"
                multiple
                accept="image/jpeg,image/png,image/webp,audio/mpeg,audio/wav"
                onChange={(e) => {
                  void upload(e.target.files);
                  e.target.value = "";
                }}
              />
            </PromptInputTools>
            <PromptInputSubmit
              aria-label="Create site"
              disabled={busy || uploading || !message.trim()}
              status={busy ? "submitted" : "ready"}
              className="size-10 rounded-xl bg-brand-lime text-brand-on-lime hover:bg-brand-lime-hover disabled:opacity-50"
            />
          </PromptInputToolbar>
        </PromptInput>
        {busy && (
          <p
            role="status"
            className="mt-4 text-center text-sm text-muted-foreground"
          >
            Building your experience…
          </p>
        )}
        {error && (
          <p role="alert" className="mt-4 text-sm text-destructive">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
