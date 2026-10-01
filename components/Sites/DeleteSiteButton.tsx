"use client";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { useSitesRequest } from "@/hooks/useSitesRequest";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import type { Site } from "@/lib/sites/schema";
export function DeleteSiteButton({
  site,
  onDeleted,
}: {
  site: Site;
  onDeleted?: () => void;
}) {
  const request = useSitesRequest();
  const cache = useQueryClient();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function remove() {
    setBusy(true);
    setError("");
    try {
      const current = await request<{ site: Site }>(`/api/sites/${site.id}`);
      let generationToken: string | undefined;
      try {
        generationToken =
          sessionStorage.getItem(`site-production:${site.id}`) || undefined;
      } catch {
        /* Storage may be blocked. */
      }
      await request(`/api/sites/${site.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          action: "delete",
          revision: current.site.revision,
          generationToken,
        }),
      });
      try {
        sessionStorage.removeItem(`site-production:${site.id}`);
      } catch {
        /* Deletion already succeeded. */
      }
      cache.removeQueries({ queryKey: ["site", site.id] });
      cache.setQueriesData<{ sites: Site[] }>(
        { queryKey: ["sites"] },
        (current) =>
          current
            ? {
                ...current,
                sites: current.sites.filter((item) => item.id !== site.id),
              }
            : current,
      );
      void cache.invalidateQueries({ queryKey: ["sites"] });
      setOpen(false);
      onDeleted?.();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <AlertDialog
      open={open}
      onOpenChange={(value) => {
        if (!busy) {
          setOpen(value);
          setError("");
        }
      }}
    >
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={`Delete ${site.name}`}>
          <Trash2 size={16} />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {site.name}?</AlertDialogTitle>
          <AlertDialogDescription>
            This permanently deletes the site, fan signups, Spotify connections,
            and site activity.
            {site.published
              ? " Its published page will go offline."
              : " Its draft will be removed."}
            {
              " Any build still finishing cannot restore it. This cannot be undone."
            }
          </AlertDialogDescription>
        </AlertDialogHeader>
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel>
          <Button variant="destructive" disabled={busy} onClick={remove}>
            {busy ? "Deleting…" : "Delete site"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
