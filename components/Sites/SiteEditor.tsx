"use client";
import { waitForSiteProduction } from "@/lib/sites/waitForSiteProduction";
import Link from "next/link";
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
  Globe,
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
      const [siteResult, signupResult] = await Promise.all([
        request<{ site: Site }>(`/api/sites/${id}`),
        request<{ signups: Result["signups"] }>(`/api/sites/${id}/signups`),
      ]);
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
      }>(`/api/sites/${id}`, {
        method: "PATCH",
        body: JSON.stringify({
          action,
          revision: query.data.site.revision,
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
      setInstruction("");
      setNotice(
        action === "generate"
          ? "Draft saved. Publish to share these changes."
          : action === "publish"
            ? "Published. Your site is ready to share."
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
  return (
    <div className="flex min-h-full flex-col">
      <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4 shadow-[0_1px_0_var(--border)]">
        <div className="flex items-center gap-4">
          <Link href="/sites" aria-label="Back to sites">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-sm font-medium">{site.name}</h1>
            <p className="mt-1 text-xs text-muted-foreground">
              {site.published
                ? hasChanges
                  ? "Published · Unpublished changes"
                  : "Published"
                : "Draft"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {site.published && (
            <Button variant="ghost" size="sm" asChild>
              <a href={`/s/${id}`} target="_blank" rel="noreferrer">
                Open site
                <ArrowUpRight size={14} />
              </a>
            </Button>
          )}
          <Button
            size="sm"
            disabled={!!busy || !site.draft || !hasChanges}
            onClick={() => act("publish")}
          >
            {busy === "publish" ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Globe size={14} />
            )}
            Publish
          </Button>
        </div>
      </div>
      <div className="grid flex-1 lg:grid-cols-[320px_1fr]">
        <aside className="flex flex-col gap-6 p-5 shadow-[1px_0_0_var(--border)]">
          <div>
            <h2 className="text-sm font-medium">The brief</h2>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
              {site.brief}
            </p>
          </div>
          {site.assets.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {site.assets
                .filter((a) => a.type === "image")
                .map((a) => (
                  <Image
                    unoptimized
                    width={64}
                    height={64}
                    key={a.url}
                    src={a.url}
                    alt={a.name}
                    className="h-16 w-16 rounded-lg object-cover"
                  />
                ))}
            </div>
          )}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void act("generate");
            }}
            className="space-y-3"
          >
            <label htmlFor="site-edit" className="block text-sm font-medium">
              {site.draft
                ? "What would you like to change?"
                : "Make your first preview"}
            </label>
            <Textarea
              id="site-edit"
              rows={4}
              maxLength={6000}
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              placeholder={
                site.draft
                  ? "Add a new level, change the artwork, or refine the controls…"
                  : "Generate a design from your brief."
              }
            />
            <Button
              className="w-full"
              disabled={!!busy || (!!site.draft && !instruction.trim())}
              type="submit"
            >
              {busy === "generate" ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Send size={14} />
              )}{" "}
              {busy === "generate"
                ? "Building…"
                : site.draft
                  ? "Update draft"
                  : "Generate preview"}
            </Button>
            <p className="text-xs leading-5 text-muted-foreground">
              Working experiences, games, and websites. Your live site changes
              only when you publish.
            </p>
          </form>
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          {notice && (
            <p role="status" className="text-sm text-muted-foreground">
              {notice}
            </p>
          )}
          {site.draft?.production?.status === "needs-review" && (
            <div className="space-y-2 text-sm text-muted-foreground">
              <p role="status">
                This draft needs another design pass. Review it before
                publishing.
              </p>
              <details>
                <summary className="cursor-pointer">Review notes</summary>
                <p className="mt-2">
                  {site.draft.production.reviews.at(-1)?.summary}
                </p>
              </details>
            </div>
          )}
          <div className="mt-auto space-y-3 pt-8">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium">Fan signups</h2>
              <span className="text-sm text-muted-foreground">
                {signups.length}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              disabled={!signups.length}
              onClick={exportFans}
            >
              <Download size={14} />
              Export emails
            </Button>
            {site.published && (
              <Button
                size="sm"
                variant="ghost"
                className="w-full text-muted-foreground"
                disabled={!!busy}
                onClick={() => act("unpublish")}
              >
                Unpublish site
              </Button>
            )}
          </div>
        </aside>
        <section className="min-w-0 bg-muted/35 p-4 md:p-6">
          <div className="mb-4 flex items-center justify-between">
            <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              Draft preview
            </p>
            <div className="flex gap-1 rounded-lg bg-background p-1 shadow-[0_0_0_1px_var(--border)]">
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
          {site.draft ? (
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
          ) : (
            <div className="flex min-h-[520px] flex-col items-center justify-center rounded-xl bg-background p-8 text-center shadow-[0_0_0_1px_var(--border)]">
              <Globe
                size={36}
                strokeWidth={1}
                className="mb-5 text-muted-foreground"
              />
              <h2 className="text-xl font-medium">
                {busy === "generate"
                  ? "Creating your experience"
                  : "Your site starts here."}
              </h2>
              <p className="mt-2 max-w-xs text-sm text-muted-foreground">
                {busy === "generate"
                  ? "Researching the release, creating the artwork, and testing your site. You can leave this page while it runs."
                  : "Generate a preview from your brief, then refine it before publishing."}
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
