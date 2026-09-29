"use client";
import { waitForSiteProduction } from "@/lib/sites/waitForSiteProduction";
import Link from "next/link";
import { SiteAudience } from "./SiteAudience";
import Image from "next/image";
import { usePrivy } from "@privy-io/react-auth";
import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowUpRight,
  Monitor,
  Smartphone,
  Send,
  Loader2,
  Download,
} from "lucide-react";
import { useSitesRequest } from "@/hooks/useSitesRequest";
import { useOrganization } from "@/providers/OrganizationProvider";
import { useUserProvider } from "@/providers/UserProvder";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { renderSite } from "@/lib/sites/renderSite";
import type { Site } from "@/lib/sites/schema";
type Result = { site: Site; signups: { email: string; created_at: string }[] };
export default function SiteEditor({ id }: { id: string }) {
  const request = useSitesRequest();
  const cache = useQueryClient();
  const router = useRouter();
  const { selectedOrgId, isInitialized } = useOrganization();
  const { userData } = useUserProvider();
  const { ready, authenticated } = usePrivy();
  const search = useSearchParams();
  const workspace = useRef<string | null | undefined>(undefined);
  useEffect(() => {
    if (!isInitialized) return;
    if (workspace.current === undefined) {
      workspace.current = selectedOrgId;
      return;
    }
    if (workspace.current !== selectedOrgId) {
      router.push("/sites");
      workspace.current = selectedOrgId;
    }
  }, [selectedOrgId, isInitialized, router]);
  const key = ["site", id, userData?.account_id, selectedOrgId];
  const query = useQuery({
    queryKey: key,
    queryFn: async () => {
      const siteResult = await request<{ site: Site }>(`/api/sites/${id}`);
      const signupResult = siteResult.site.published
        ? await request<{ signups: Result["signups"] }>(
            `/api/sites/${id}/signups`,
          )
        : { signups: [] };
      return { ...siteResult, ...signupResult };
    },
    enabled: ready && authenticated && !!userData?.account_id && isInitialized,
  });
  const spotifyConfig = useQuery({
    queryKey: ["sites-spotify-config"],
    queryFn: async () => {
      const response = await fetch("/api/sites/spotify/config");
      if (!response.ok) throw new Error("Could not load Spotify configuration");
      return response.json() as Promise<{
        configured: boolean;
        redirectUri: string | null;
      }>;
    },
  });
  const callback = spotifyConfig.data?.redirectUri;
  const spotifyOrigin = callback ? new URL(callback).origin : null;
  const [instruction, setInstruction] = useState("");
  const [busy, setBusy] = useState("");
  const [error, setError] = useState(
    search.get("generationFailed")
      ? "Your brief is saved, but generation failed. Try generating the preview again."
      : "",
  );
  const [view, setView] = useState<"site" | "audience">("site");
  const [mobile, setMobile] = useState(false);
  const [notice, setNotice] = useState("");
  useEffect(() => {
    if (!query.data?.site.id) return;
    const token = sessionStorage.getItem(`site-production:${id}`);
    if (!token) return;
    const controller = new AbortController();
    let active = true;
    queueMicrotask(() => {
      if (active) {
        setBusy("generate");
        setError("");
      }
    });
    void waitForSiteProduction(
      request,
      id,
      { generation: { token, status: "running" } },
      (message) => {
        if (active) setNotice(message);
      },
      controller.signal,
    )
      .then((result) => {
        if (active) {
          cache.setQueryData(
            ["site", id, userData?.account_id, selectedOrgId],
            (current: Record<string, unknown> | undefined) => ({
              ...current,
              site: result.site,
            }),
          );
          setNotice("Draft saved. Review it before publishing.");
        }
      })
      .catch((error) => {
        if (active) {
          setError((error as Error).message);
          setNotice("");
        }
      })
      .finally(() => {
        if (active) setBusy("");
      });
    return () => {
      active = false;
      controller.abort();
    };
  }, [
    id,
    query.data?.site.id,
    request,
    cache,
    userData?.account_id,
    selectedOrgId,
  ]);
  async function act(action: "generate" | "publish" | "unpublish") {
    if (!query.data) return;
    setBusy(action);
    setError("");
    setNotice("");
    try {
      let result = await request<{
        site: Site;
        generation?: { token: string; status: string };
        fanConnection?: string;
      }>(`/api/sites/${id}`, {
        method: "PATCH",
        body: JSON.stringify({
          action,
          revision: query.data.site.revision,
          ...(action === "publish"
            ? { returnUrl: `${location.origin}/s/${id}` }
            : {}),
          ...(action === "generate"
            ? {
                instruction: instruction || query.data.site.brief,
                background: true,
              }
            : {}),
        }),
      });
      if (action === "generate")
        result = await waitForSiteProduction(request, id, result, setNotice);
      cache.setQueryData(key, { ...query.data, site: result.site });
      void cache.invalidateQueries({ queryKey: ["sites"] });
      if (action !== "generate")
        void cache.invalidateQueries({ queryKey: key });
      setInstruction("");
      setNotice(
        action === "generate"
          ? "Draft saved. Publish to share these changes."
          : action === "publish"
            ? result.fanConnection === "subscription-required"
              ? "Published. Email signup is ready. Spotify fan connection is included with a paid subscription."
              : "Published. Your site is ready to share."
            : "Site unpublished. Your draft is saved.",
      );
    } catch (e) {
      setNotice("");
      setError((e as Error).message);
      void cache.invalidateQueries({ queryKey: key });
    } finally {
      setBusy("");
    }
  }
  function exportFans() {
    const rows = query.data?.signups || [];
    const csv = [
      "Email,Signed up",
      ...rows.map((row) =>
        [row.email, row.created_at]
          .map(
            (value) =>
              '"' +
              (/^[=+\-@]/.test(value) ? "'" : "") +
              value.replace(/"/g, '""') +
              '"',
          )
          .join(","),
      ),
    ].join("\r\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "fan-signups.csv";
    a.click();
    URL.revokeObjectURL(url);
  }
  if (!ready || !authenticated || !isInitialized)
    return (
      <p role="status" className="p-10 text-muted-foreground">
        {ready && !authenticated
          ? "Sign in to Recoup to continue."
          : "Loading your workspace…"}
      </p>
    );
  if (query.isPending)
    return (
      <p role="status" className="p-10 text-muted-foreground">
        Loading your site…
      </p>
    );
  if (query.isError)
    return (
      <div className="p-10">
        <p role="alert">{query.error.message}</p>
        <Button
          className="mt-4"
          variant="outline"
          onClick={() => query.refetch()}
        >
          Try again
        </Button>
      </div>
    );
  const { site, signups } = query.data;
  const hasChanges =
    JSON.stringify(site.draft) !== JSON.stringify(site.published);
  const building = busy === "generate";
  const artwork = site.assets.find((asset) => asset.type === "image");
  return (
    <div className="flex min-h-full flex-col">
      <header className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 shadow-[0_1px_0_var(--border)]">
        <div className="flex min-w-0 items-center gap-3">
          <Link href="/sites" aria-label="Back to sites">
            <ArrowLeft size={18} />
          </Link>
          {artwork && (
            <Image
              unoptimized
              src={artwork.url}
              alt=""
              width={40}
              height={40}
              className="h-10 w-10 rounded-md object-cover"
            />
          )}
          <div className="min-w-0">
            <h1 className="max-w-xl text-sm font-medium">{site.name}</h1>
            <p className="mt-1 text-xs text-muted-foreground">
              {site.published
                ? hasChanges
                  ? "Published · Unpublished changes"
                  : "Published"
                : building
                  ? "Building"
                  : "Draft"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {site.published && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(
                      `${location.origin}/s/${id}`,
                    );
                    setNotice("Link copied.");
                  } catch {
                    setError(
                      "Could not copy the link. Open your site to copy its address.",
                    );
                  }
                }}
              >
                Copy link
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <a href={`/s/${id}`} target="_blank" rel="noreferrer">
                  Open site
                  <ArrowUpRight size={14} />
                </a>
              </Button>
            </>
          )}
          {site.draft && (!site.published || hasChanges) && (
            <Button size="sm" disabled={!!busy} onClick={() => act("publish")}>
              {busy === "publish" && (
                <Loader2 size={14} className="animate-spin" />
              )}
              {site.published ? "Publish changes" : "Publish"}
            </Button>
          )}
        </div>
      </header>
      {error && (
        <p role="alert" className="px-5 pt-4 text-sm text-destructive">
          {error}
        </p>
      )}
      {notice && !building && (
        <p role="status" className="px-5 pt-4 text-sm text-muted-foreground">
          {notice}
        </p>
      )}
      {site.published && (
        <nav aria-label="Site views" className="flex gap-2 px-5 pt-4">
          <Button
            variant={view === "site" ? "secondary" : "ghost"}
            aria-pressed={view === "site"}
            onClick={() => setView("site")}
          >
            Site
          </Button>
          <Button
            variant={view === "audience" ? "secondary" : "ghost"}
            aria-pressed={view === "audience"}
            onClick={() => setView("audience")}
          >
            Audience
          </Button>
        </nav>
      )}
      {site.published && view === "audience" ? (
        <main className="mx-auto w-full max-w-4xl space-y-6 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium">
              Email signups · {signups.length}
            </h2>
            {signups.length > 0 && (
              <Button variant="outline" size="sm" onClick={exportFans}>
                <Download size={14} />
                Export emails
              </Button>
            )}
          </div>
          {!signups.length && (
            <p className="text-sm text-muted-foreground">
              Share your site to start growing your audience. New signups will
              appear here.
            </p>
          )}
          <SiteAudience id={id} />
        </main>
      ) : !site.draft ? (
        <main
          className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-24 text-center"
          aria-busy={building}
        >
          {building && (
            <Loader2 size={28} className="animate-spin text-muted-foreground" />
          )}
          <h2 className="text-2xl font-medium">
            {building
              ? "Creating your experience"
              : "Let’s finish your preview"}
          </h2>
          <p
            role="status"
            className="max-w-sm text-sm leading-6 text-muted-foreground"
          >
            {building
              ? "You can leave this page—we’ll keep building. Your preview will appear here when it’s ready."
              : "Your release is saved. Try building your preview again."}
          </p>
          {!building && (
            <Button disabled={!!busy} onClick={() => act("generate")}>
              Build preview
            </Button>
          )}
        </main>
      ) : (
        <main className="min-w-0 flex-1 p-4 md:p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <p role="status" className="text-sm text-muted-foreground">
              {building
                ? "Updating your site. You can keep playing this version."
                : "Play your site, then publish or ask for a change."}
            </p>
            <div className="flex shrink-0 gap-1 rounded-lg bg-background p-1 shadow-[0_0_0_1px_var(--border)]">
              <Button
                size="icon"
                variant={mobile ? "ghost" : "secondary"}
                aria-label="Desktop preview"
                aria-pressed={!mobile}
                onClick={() => setMobile(false)}
              >
                <Monitor size={16} />
              </Button>
              <Button
                size="icon"
                variant={mobile ? "secondary" : "ghost"}
                aria-label="Mobile preview"
                aria-pressed={mobile}
                onClick={() => setMobile(true)}
              >
                <Smartphone size={16} />
              </Button>
            </div>
          </div>
          <iframe
            title={`${site.name} draft preview`}
            sandbox="allow-scripts allow-downloads allow-popups allow-popups-to-escape-sandbox"
            allow="web-share *"
            srcDoc={renderSite(
              site.draft,
              undefined,
              spotifyConfig.data?.configured && spotifyOrigin
                ? `${spotifyOrigin}/s/spotify/connect?release=${encodeURIComponent(site.release_url)}`
                : undefined,
            )}
            className={`mx-auto h-[72vh] min-h-[520px] rounded-lg bg-white shadow-sm ${mobile ? "w-full max-w-[390px]" : "w-full"}`}
          />
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!busy && instruction.trim()) void act("generate");
            }}
            className="mx-auto mt-5 max-w-3xl space-y-3"
          >
            <label htmlFor="site-edit" className="text-sm font-medium">
              What would you like to change?
            </label>
            <div className="flex items-end gap-2">
              <Textarea
                id="site-edit"
                rows={2}
                maxLength={6000}
                value={instruction}
                disabled={!!busy}
                onChange={(e) => setInstruction(e.target.value)}
                placeholder="Change the artwork, add a level, refine the controls…"
              />
              <Button
                type="submit"
                disabled={!!busy || !instruction.trim()}
                aria-label="Update draft"
              >
                {building ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Send size={16} />
                )}
              </Button>
            </div>
          </form>
          {site.draft.production?.status === "needs-review" && (
            <details className="mx-auto mt-4 max-w-3xl text-sm text-muted-foreground">
              <summary className="cursor-pointer">
                This draft needs another design pass
              </summary>
              <p className="mt-2">
                {site.draft.production.reviews.at(-1)?.summary}
              </p>
            </details>
          )}
          <details className="mx-auto mt-5 max-w-3xl text-sm text-muted-foreground">
            <summary className="cursor-pointer">Project details</summary>
            <p className="mt-3 whitespace-pre-wrap">{site.brief}</p>
            {site.published && (
              <Button
                className="mt-3"
                size="sm"
                variant="ghost"
                disabled={!!busy}
                onClick={() => act("unpublish")}
              >
                Unpublish site
              </Button>
            )}
          </details>
        </main>
      )}
    </div>
  );
}
