"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Plus, Music2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ArtistEntry {
  name: string;
  spotifyUrl?: string;
}

interface Props {
  artists: ArtistEntry[];
  onUpdate: (artists: ArtistEntry[]) => void;
  onNext: () => void;
}

export function OnboardingArtistsStep({ artists, onUpdate, onNext }: Props) {
  const [newName, setNewName] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [showUrlField, setShowUrlField] = useState(false);

  const addArtist = () => {
    if (!newName.trim()) return;
    onUpdate([...artists, { name: newName.trim(), spotifyUrl: newUrl.trim() || undefined }]);
    setNewName("");
    setNewUrl("");
    setShowUrlField(false);
  };

  const removeArtist = (idx: number) => {
    onUpdate(artists.filter((_, i) => i !== idx));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") addArtist();
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          Add your priority artists
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          We'll run deep research on each one — fan segments, release data, competitive
          analysis, and proactive tasks — before you ever open a chat.
        </p>
      </div>

      {/* Artist list */}
      {artists.length > 0 && (
        <ul className="flex flex-col gap-2">
          {artists.map((a, i) => (
            <li
              key={i}
              className="flex items-center justify-between rounded-lg border bg-muted/30 px-3 py-2"
            >
              <div className="flex items-center gap-2">
                <Music2 className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{a.name}</p>
                  {a.spotifyUrl && (
                    <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                      {a.spotifyUrl}
                    </p>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeArtist(i)}
                className="rounded-md p-1 hover:bg-muted transition-colors"
              >
                <X className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Add artist input */}
      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <Input
            placeholder="Artist name"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={addArtist}
            disabled={!newName.trim()}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <button
          type="button"
          onClick={() => setShowUrlField(v => !v)}
          className="self-start text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground transition-colors"
        >
          {showUrlField ? "Hide" : "+ Add Spotify URL (optional for better results)"}
        </button>

        {showUrlField && (
          <Input
            placeholder="https://open.spotify.com/artist/..."
            value={newUrl}
            onChange={e => setNewUrl(e.target.value)}
            onKeyDown={handleKeyDown}
            className="text-sm"
          />
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Button
          onClick={onNext}
          disabled={artists.length === 0}
          className="w-full"
        >
          Run deep research ✨
        </Button>
        {artists.length === 0 && (
          <button
            type="button"
            onClick={onNext}
            className="text-xs text-center text-muted-foreground hover:text-foreground transition-colors"
          >
            Skip for now →
          </button>
        )}
      </div>
    </div>
  );
}
