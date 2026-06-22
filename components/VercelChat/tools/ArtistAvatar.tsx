"use client";

import React from "react";
import { User } from "lucide-react";

/**
 * Avatar with a fade-in load + graceful icon fallback. Its load/error state is
 * owned locally, so a parent that remounts it via `key={imageUrl}` gets a fresh
 * start per avatar — no useEffect reset, no stale-state flicker between URLs.
 */
const ArtistAvatar = ({
  imageUrl,
  name,
}: {
  imageUrl: string;
  name: string;
}) => {
  const [imgLoaded, setImgLoaded] = React.useState(false);
  const [imgErrored, setImgErrored] = React.useState(false);

  if (imgErrored) {
    return (
      <div className="flex size-16 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground shadow-sm">
        <User className="size-6 opacity-60" />
      </div>
    );
  }

  return (
    <div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-muted shadow-sm">
      {!imgLoaded ? (
        <div className="absolute inset-0 flex animate-pulse items-center justify-center bg-muted text-muted-foreground">
          <User className="size-6 opacity-50" />
        </div>
      ) : null}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageUrl}
        alt={name}
        className={`size-full object-cover transition-opacity duration-300 ${
          imgLoaded ? "opacity-100" : "opacity-0"
        }`}
        onLoad={() => setImgLoaded(true)}
        onError={() => setImgErrored(true)}
      />
    </div>
  );
};

export default ArtistAvatar;
