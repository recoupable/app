"use client";

import { useState } from "react";
import {
  Check,
  ChevronDown,
  Building2,
  Users,
  Plus,
  Search,
} from "lucide-react";
import { usePrivy } from "@privy-io/react-auth";
import { useOrganization } from "@/providers/OrganizationProvider";
import { useArtistProvider } from "@/providers/ArtistProvider";
import useAccountOrganizations from "@/hooks/useAccountOrganizations";
import { requestContextSwitch } from "@/lib/chat/requestContextSwitch";
import { isActiveChatRoomPath } from "@/lib/chat/isActiveChatRoomPath";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ArtistRecord } from "@/types/Artist";

export default function WorkspaceContextBar() {
  const { authenticated } = usePrivy();
  const { selectedOrgId, setSelectedOrgId, openCreateOrg, isInitialized } =
    useOrganization();
  const {
    data: organizations = [],
    isPending: loadingOrgs,
    isError: orgError,
  } = useAccountOrganizations();
  const {
    selectedArtist,
    artists,
    isLoading,
    isError,
    setSelectedArtist,
    toggleCreation,
  } = useArtistProvider();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const workspace = selectedOrgId
    ? organizations.find((org) => org.organization_id === selectedOrgId)
        ?.organization_name || "Organization"
    : "Personal";
  const artistLabel =
    selectedArtist?.name ||
    (isLoading
      ? "Loading artists…"
      : isError
        ? "Artists unavailable"
        : artists.length
          ? "All artists"
          : "No artists yet");
  const selectArtist = (artist: ArtistRecord | null) => {
    setOpen(false);
    if ((artist?.account_id ?? null) === (selectedArtist?.account_id ?? null))
      return;
    requestContextSwitch(() => {
      setSelectedArtist(artist);
      if (isActiveChatRoomPath(window.location.pathname))
        window.location.href = "/";
    });
  };
  if (!authenticated) return null;
  const trigger =
    "flex min-w-0 items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
  return (
    <nav
      aria-label="Workspace and artist"
      className="flex min-w-0 flex-1 items-center gap-1 bg-card px-2 py-2"
    >
      <DropdownMenu>
        <DropdownMenuTrigger
          disabled={!isInitialized}
          className={trigger}
          aria-label={`Workspace: ${workspace}`}
        >
          <Building2 className="size-4 shrink-0 text-muted-foreground" />
          <span className="max-w-[130px] truncate sm:max-w-[220px]">
            {workspace}
          </span>
          <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-64 p-2">
          <p className="px-2 py-2 text-xs text-muted-foreground">Workspace</p>
          <DropdownMenuItem onSelect={() => setSelectedOrgId(null)}>
            Personal{!selectedOrgId && <Check className="ml-auto" />}
          </DropdownMenuItem>
          {organizations.map((org) => (
            <DropdownMenuItem
              key={org.organization_id}
              onSelect={() => setSelectedOrgId(org.organization_id)}
            >
              {org.organization_name || "Organization"}
              {org.organization_id === selectedOrgId && (
                <Check className="ml-auto" />
              )}
            </DropdownMenuItem>
          ))}
          {loadingOrgs && (
            <p className="p-2 text-xs text-muted-foreground">
              Loading organizations…
            </p>
          )}
          {orgError && (
            <p className="p-2 text-xs text-destructive">
              Couldn’t load organizations. Try again later.
            </p>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={openCreateOrg}>
            <Plus />
            Create organization
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <span aria-hidden="true" className="text-border">
        /
      </span>
      <button
        type="button"
        className={trigger}
        onClick={() => {
          setSearch("");
          setOpen(true);
        }}
        aria-label={`Artist: ${artistLabel}`}
      >
        <Users className="hidden size-4 shrink-0 text-muted-foreground sm:block" />
        <span className="max-w-[150px] truncate sm:max-w-[260px]">
          {artistLabel}
        </span>
        <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" />
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="gap-0 overflow-hidden p-0 sm:max-w-md"
          aria-describedby={undefined}
        >
          <DialogHeader className="px-5 pb-3 pt-5">
            <DialogTitle>Artists in {workspace}</DialogTitle>
          </DialogHeader>
          <div className="mx-5 mb-3 flex items-center gap-2 rounded-xl bg-muted px-3">
            <Search className="size-4 text-muted-foreground" />
            <input
              autoFocus
              aria-label="Search artists"
              placeholder="Find an artist…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full bg-transparent py-3 text-sm outline-none"
            />
          </div>
          <div className="max-h-[50dvh] overflow-y-auto px-2 pb-2">
            {artists.length > 0 && (
              <button
                type="button"
                onClick={() => selectArtist(null)}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm hover:bg-muted focus-visible:bg-muted"
              >
                <Users className="size-5 text-muted-foreground" />
                All artists
                {!selectedArtist && <Check className="ml-auto size-4" />}
              </button>
            )}
            {isLoading ? (
              <p className="p-3 text-sm leading-relaxed text-muted-foreground">
                Loading artists…
              </p>
            ) : isError ? (
              <p className="p-3 text-sm text-destructive">
                Couldn’t load artists. Try again later.
              </p>
            ) : (
              artists
                .filter((artist) =>
                  artist.name?.toLowerCase().includes(search.toLowerCase()),
                )
                .map((artist) => (
                  <button
                    type="button"
                    key={artist.account_id}
                    onClick={() => selectArtist(artist)}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm hover:bg-muted focus-visible:bg-muted"
                  >
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-xs text-muted-foreground">
                      {artist.name?.slice(0, 2).toUpperCase()}
                    </span>
                    <span className="truncate">{artist.name}</span>
                    {artist.account_id === selectedArtist?.account_id && (
                      <Check className="ml-auto size-4 shrink-0" />
                    )}
                  </button>
                ))
            )}
            {!isLoading &&
              !isError &&
              !artists.some((artist) =>
                artist.name?.toLowerCase().includes(search.toLowerCase()),
              ) && (
                <p className="p-3 text-sm leading-relaxed text-muted-foreground">
                  {artists.length
                    ? "No artists match your search."
                    : "Add your first artist to get started."}
                </p>
              )}
          </div>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              toggleCreation();
            }}
            className="flex items-center gap-2 px-5 py-4 text-sm font-medium shadow-[0_-1px_0_var(--border)] hover:bg-muted"
          >
            <Plus className="size-4" />
            Add artist
          </button>
        </DialogContent>
      </Dialog>
    </nav>
  );
}
