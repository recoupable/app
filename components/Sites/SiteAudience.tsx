"use client";
import { useQuery } from "@tanstack/react-query";
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
export function SiteAudience({ id }: { id: string }) {
  const request = useSitesRequest();
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
          {Object.values(query.data.activity).some(
            (value) => typeof value === "number" && value > 0,
          ) ? (
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
          ) : (
            <p className="py-6 text-sm text-muted-foreground">
              Visits, plays and shares will appear after fans start using your
              site.
            </p>
          )}
          <h3 className="text-sm font-medium">
            Spotify fans · {query.data.fans.total}
          </h3>
          <p className="text-xs text-muted-foreground">
            {query.data.settings.config?.enabled
              ? "Spotify fan connection is on."
              : "Spotify fan connection is included with a paid subscription and configured when you publish."}
          </p>
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
    </section>
  );
}
