import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ReleaseIntakeForm({
  disabled,
  onAdd,
}: {
  disabled: boolean;
  onAdd: (url: string) => Promise<void>;
}) {
  const id = useId();
  const [url, setUrl] = useState("");
  return (
    <form
      className="space-y-3 rounded-xl p-4 shadow-[0_0_0_1px_var(--border)]"
      onSubmit={(event) => {
        event.preventDefault();
        if (!disabled) void onAdd(url);
      }}
    >
      <label htmlFor={id} className="block text-sm font-medium">
        Spotify release URL
      </label>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Input
          id={id}
          type="url"
          required
          maxLength={2048}
          value={url}
          disabled={disabled}
          onChange={(event) => setUrl(event.target.value)}
          placeholder="https://open.spotify.com/album/…"
          aria-describedby={`${id}-help`}
        />
        <Button type="submit" disabled={disabled || !url.trim()}>
          Add release URL
        </Button>
      </div>
      <p id={`${id}-help`} className="text-sm text-muted-foreground">
        Save an album or single’s album link in this workspace. Metadata
        collection and verification are separate steps.
      </p>
    </form>
  );
}
