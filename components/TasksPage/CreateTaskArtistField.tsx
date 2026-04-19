"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateTaskFormContext } from "@/providers/CreateTaskFormProvider";

export function CreateTaskArtistField() {
  const {
    artistAccountId,
    setArtistAccountId,
    isSubmitting,
    isLoadingArtists,
    artistOptions,
    errors,
  } = useCreateTaskFormContext();

  return (
    <div className="space-y-2">
      <Label htmlFor="task-artist">Artist</Label>
      <Select
        value={artistAccountId}
        onValueChange={setArtistAccountId}
        disabled={
          isSubmitting || isLoadingArtists || artistOptions.length === 0
        }
      >
        <SelectTrigger
          id="task-artist"
          aria-invalid={Boolean(errors.artist)}
          aria-describedby={
            [
              artistOptions.length === 0 && !isLoadingArtists
                ? "task-artist-empty"
                : null,
              errors.artist ? "task-artist-error" : null,
            ]
              .filter(Boolean)
              .join(" ") || undefined
          }
        >
          <SelectValue placeholder="Select an artist" />
        </SelectTrigger>
        <SelectContent>
          {artistOptions.map((artist) => (
            <SelectItem key={artist.id} value={artist.id}>
              {artist.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {artistOptions.length === 0 && !isLoadingArtists ? (
        <p id="task-artist-empty" className="text-sm text-muted-foreground">
          No artists are available. Create or select an artist first.
        </p>
      ) : null}
      {errors.artist ? (
        <p id="task-artist-error" role="alert" className="text-sm text-red-600">
          {errors.artist}
        </p>
      ) : null}
    </div>
  );
}
