"use client";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSitesRequest } from "@/hooks/useSitesRequest";
import { useUserProvider } from "@/providers/UserProvder";
import { Button } from "@/components/ui/button";
type Settings = {
  config: {
    revision: number;
    enabled: boolean;
    marketing_text: string;
    return_url: string;
  } | null;
  connectUrl: string | null;
};
type Activity = {
  visits: number;
  starts: number;
  completions: number;
  replays: number;
  shares: number;
};
type Fans = {
  total: number;
  fans: {
    id: string;
    display_name: string | null;
    email: string | null;
    last_connected_at: string;
  }[];
};
export function SiteAudience({ id, name }: { id: string; name: string }) {
  const request = useSitesRequest();
  const cache = useQueryClient();
  const { userData } = useUserProvider();
  const key = ["site-audience", id, userData?.account_id];
  const query = useQuery({
    queryKey: key,
    enabled: !!userData?.account_id,
    queryFn: async () => {
      const [activity, fans, settings] = await Promise.all([
        request<Activity>(`/api/sites/${id}/activity`),
        request<Fans>(`/api/sites/${id}/fans`),
        request<Settings>(`/api/sites/${id}/fan-connection`),
      ]);
      return { activity, fans, settings };
    },
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [terms, setTerms] = useState("");
  async function toggle() {
    if (!query.data) return;
    setBusy(true);
    setError("");
    try {
      const config = query.data.settings.config;
      await request(`/api/sites/${id}/fan-connection`, {
        method: "PUT",
        body: JSON.stringify({
          enabled: !config?.enabled,
          revision: config?.revision ?? 0,
          returnUrl: config?.return_url || `${location.origin}/s/${id}`,
          marketingText:
            terms ||
            config?.marketing_text ||
            `I agree to receive release announcements and offers by email from ${name}.`,
        }),
      });
      await cache.invalidateQueries({ queryKey: key });
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Could not update fan connection",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="space-y-3 pt-5" aria-label="Audience activity">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium">Audience activity</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => query.refetch()}
          disabled={query.isFetching}
        >
          Refresh
        </Button>
      </div>
      {query.isPending ? (
        <p className="text-xs text-muted-foreground">Loading audience…</p>
      ) : query.isError ? (
        <p role="alert" className="text-xs text-destructive">
          Audience reporting is unavailable. Try refreshing.
        </p>
      ) : (
        <>
          <p className="text-xs text-muted-foreground">
            Last 30 days · browser-reported activity
          </p>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            {Object.entries(query.data.activity)
              .filter(([k]) =>
                [
                  "visits",
                  "starts",
                  "completions",
                  "replays",
                  "shares",
                ].includes(k),
              )
              .map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-lg p-3 shadow-[0_0_0_1px_var(--border)]"
                >
                  <dt className="capitalize text-xs text-muted-foreground">
                    {label}
                  </dt>
                  <dd className="text-lg font-semibold">{value}</dd>
                </div>
              ))}
          </dl>
          <h3 className="text-sm font-medium">
            Spotify fans · {query.data.fans.total}
          </h3>
          <p className="text-xs text-muted-foreground">
            Included in your paid subscription. Connects fans to this site’s
            artist.
          </p>
          {!query.data.settings.config?.enabled && (
            <label className="block text-xs">
              Fan agreement
              <textarea
                className="mt-2 w-full rounded-md bg-background p-2 shadow-[0_0_0_1px_var(--border)]"
                value={
                  terms ||
                  query.data.settings.config?.marketing_text ||
                  `I agree to receive release announcements and offers by email from ${name}.`
                }
                onChange={(e) => setTerms(e.target.value)}
                maxLength={1000}
              />
            </label>
          )}
          <Button variant="outline" size="sm" disabled={busy} onClick={toggle}>
            {busy
              ? "Saving…"
              : query.data.settings.config?.enabled
                ? "Disable Spotify fan connection"
                : "Enable Spotify fan connection"}
          </Button>
          {query.data.fans.fans.length > 0 && (
            <ul className="max-h-64 space-y-2 overflow-auto text-xs">
              {query.data.fans.fans.map((fan) => (
                <li
                  key={fan.id}
                  className="rounded-md p-2 shadow-[0_0_0_1px_var(--border)]"
                >
                  <p className="font-medium">
                    {fan.display_name || "Spotify fan"}
                  </p>
                  <p className="break-all text-muted-foreground">
                    {fan.email || "No email shared"}
                  </p>
                </li>
              ))}
            </ul>
          )}
          {query.data.fans.total > query.data.fans.fans.length && (
            <p className="text-xs text-muted-foreground">
              Showing the most recent {query.data.fans.fans.length} fans.
            </p>
          )}
        </>
      )}
      {error && (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
    </section>
  );
}
