"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";
import { useQueryClient } from "@tanstack/react-query";
import { useOrganization } from "@/providers/OrganizationProvider";
import { useUserProvider } from "@/providers/UserProvder";
import useAccountOrganizations from "@/hooks/useAccountOrganizations";
import { resolveSelectedOrgId } from "@/lib/catalog/resolveSelectedOrgId";
import { createCatalog } from "@/lib/catalog/createCatalog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function AddCatalogButton({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const { selectedOrgId, isInitialized } = useOrganization();
  const memberships = useAccountOrganizations();
  const workspaceReady =
    isInitialized && (!selectedOrgId || memberships.isSuccess);
  const organizationId = resolveSelectedOrgId(selectedOrgId, memberships.data);
  const { userData } = useUserProvider();
  const { getAccessToken } = usePrivy();
  const queryClient = useQueryClient();
  const router = useRouter();

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (pending || !name.trim() || !workspaceReady) return;
    setPending(true);
    setError("");
    try {
      const token = await getAccessToken();
      if (!token) throw new Error("Please sign in again to add a catalog.");
      const id = await createCatalog(name, token, organizationId);
      void queryClient.invalidateQueries({
        queryKey: ["catalogs", userData?.account_id],
      });
      setOpen(false);
      setName("");
      router.push(`/catalogs/${id}?tab=songs`);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Could not add catalog. Please try again.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!pending) {
          setOpen(value);
          setError("");
        }
      }}
    >
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className={className}
          disabled={!workspaceReady}
        >
          {children ?? "Add catalog"}
        </Button>
      </DialogTrigger>
      <DialogContent
        onInteractOutside={(event) => {
          if (pending) event.preventDefault();
        }}
        onEscapeKeyDown={(event) => {
          if (pending) event.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle>Add catalog</DialogTitle>
          <DialogDescription>
            Name your catalog, then upload a CSV of songs. No artist profile
            needed.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="flex flex-col gap-4">
          <div className="space-y-2">
            <Label htmlFor="new-catalog-name">Catalog name</Label>
            <Input
              id="new-catalog-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Releases 2026"
              required
              disabled={pending}
              maxLength={200}
            />
          </div>
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          <Button type="submit" disabled={pending || !name.trim()}>
            {pending ? "Adding catalog…" : "Add catalog"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
