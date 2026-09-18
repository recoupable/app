"use client";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Globe, Plus, RefreshCw } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { usePrivy } from "@privy-io/react-auth";
import { useOrganization } from "@/providers/OrganizationProvider";
import { useArtistProvider } from "@/providers/ArtistProvider";
import { useUserProvider } from "@/providers/UserProvder";
import { useSitesRequest } from "@/hooks/useSitesRequest";
import { Button } from "@/components/ui/button";
import type { Site } from "@/lib/sites/schema";
export default function SitesIndex() {
  const { selectedOrgId, isInitialized } = useOrganization();
  const { selectedArtist } = useArtistProvider();
  const { userData } = useUserProvider();
  const { authenticated, login } = usePrivy();
  const request = useSitesRequest();
  const params = new URLSearchParams();
  if (selectedOrgId) params.set("organizationId", selectedOrgId);
  if (selectedArtist) params.set("artistId", selectedArtist.account_id);
  const query = useQuery({
    queryKey: [
      "sites",
      userData?.account_id,
      selectedOrgId,
      selectedArtist?.account_id,
    ],
    queryFn: () => request<{ sites: Site[] }>(`/api/sites?${params}`),
    enabled: authenticated && isInitialized,
  });
  return (
    <div className="mx-auto max-w-6xl px-6 py-10 md:px-10 md:py-12">
      <div className="mb-10 flex items-start justify-between gap-4">
        <div>
          <p className="mb-3 font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Your music, online
          </p>
          <h1 className="text-3xl font-medium tracking-tight">Sites</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {selectedArtist
              ? `Websites and release pages for ${selectedArtist.name}.`
              : "Create, publish, and collect fan signups."}
          </p>
        </div>
        {authenticated && (
          <Button asChild>
            <Link href="/sites/new">
              <Plus size={16} />
              Create site
            </Link>
          </Button>
        )}
      </div>
      {!authenticated ? (
        <div className="rounded-2xl bg-muted/40 p-10">
          <h2 className="text-xl">Your next release starts here.</h2>
          <p className="my-4 text-muted-foreground">
            Sign in to create and manage your sites.
          </p>
          <Button onClick={login}>Sign in</Button>
        </div>
      ) : query.isError ? (
        <div role="alert" className="rounded-xl bg-muted p-6">
          <p>{query.error.message}</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => query.refetch()}
          >
            <RefreshCw size={14} />
            Try again
          </Button>
        </div>
      ) : query.isPending ? (
        <p role="status" className="py-16 text-muted-foreground">
          Loading sites…
        </p>
      ) : query.data?.sites.length ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {query.data.sites.map((site) => (
            <Link
              key={site.id}
              href={`/sites/${site.id}`}
              className="group overflow-hidden rounded-xl shadow-[0_0_0_1px_var(--border)] transition-shadow hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
            >
              <div
                className="flex aspect-[4/3] items-center justify-center overflow-hidden bg-muted"
                style={{
                  background: site.draft?.design.background,
                  color: site.draft?.design.foreground,
                }}
              >
                {site.assets.find((a) => a.type === "image") ? (
                  <Image
                    unoptimized
                    width={600}
                    height={450}
                    src={site.assets.find((a) => a.type === "image")!.url}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="px-8 text-center text-3xl tracking-tight">
                    {site.draft?.design.headline || site.name}
                  </span>
                )}
              </div>
              <div className="p-5">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="truncate font-medium">{site.name}</h2>
                  <ArrowUpRight size={16} />
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${site.published ? "bg-emerald-500" : "bg-muted-foreground"}`}
                    />
                    {site.published ? "Published" : "Draft"}
                  </span>
                  <span>{new Date(site.updated_at).toLocaleDateString()}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="grid overflow-hidden rounded-2xl shadow-[0_0_0_1px_var(--border)] md:grid-cols-2">
          <div className="flex flex-col items-start justify-center p-8 md:p-12">
            <Globe
              size={24}
              strokeWidth={1.5}
              className="mb-8 text-muted-foreground"
            />
            <h2 className="max-w-sm text-3xl font-medium leading-tight tracking-tight">
              Give your next release
              <br />a place of its own.
            </h2>
            <p className="my-5 max-w-sm text-sm leading-6 text-muted-foreground">
              Bring the artwork and an idea. Build a page, make it yours, and
              share it with your fans.
            </p>
            <Button asChild>
              <Link href="/sites/new">
                Create your first site
                <ArrowUpRight size={16} />
              </Link>
            </Button>
          </div>
          <div
            aria-hidden="true"
            className="flex min-h-80 items-center justify-center bg-muted/60 p-10"
          >
            <div className="w-full max-w-xs -rotate-3 overflow-hidden bg-[#24382f] text-[#e6e6d5] shadow-xl">
              <div className="p-7">
                <div className="text-[9px] uppercase tracking-[.25em]">
                  A new chapter
                </div>
                <div className="my-7 aspect-square bg-[radial-gradient(ellipse_at_30%_25%,#e0be83,transparent_65%),linear-gradient(135deg,#6a8272,#182920)]" />
                <div className="font-serif text-4xl leading-none">
                  Something
                  <br />
                  worth hearing.
                </div>
                <div className="mt-6 h-7 w-24 bg-[#e6e6d5]" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
