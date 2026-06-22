"use client";

import React from "react";
import { motion } from "framer-motion";
import { Disc3 } from "lucide-react";
import { SpotifyArtistAlbumsResultUIType } from "@/types/spotify";
import SpotifyContentCard from "./SpotifyContentCard";
import { ToolCard, ToolCardBody } from "./shared/ToolCard";
import { ToolEmpty } from "./shared/ToolEmpty";

const gridStagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};

const GetSpotifyArtistAlbumsResult: React.FC<{
  result: SpotifyArtistAlbumsResultUIType;
}> = ({ result }) => {
  if (!result.items || result.items.length === 0) {
    return (
      <ToolCard
        icon={Disc3}
        tone="success"
        title="Artist albums"
        subtitle="No releases"
      >
        <ToolEmpty
          icon={Disc3}
          title="No albums found"
          description="This artist has no albums available on Spotify."
        />
      </ToolCard>
    );
  }

  const showingMore = result.total > result.items.length;

  return (
    <ToolCard
      icon={Disc3}
      tone="success"
      title="Artist albums"
      subtitle={
        showingMore
          ? `Showing ${result.items.length} of ${result.total}`
          : `${result.items.length} release${result.items.length === 1 ? "" : "s"}`
      }
    >
      <ToolCardBody>
        <motion.div
          variants={gridStagger}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 gap-1 sm:grid-cols-3 md:grid-cols-4"
        >
          {result.items.map((album) => {
            const releaseYear = album.release_date
              ? new Date(album.release_date).getFullYear()
              : null;

            return (
              <SpotifyContentCard
                key={album.id}
                content={album}
                subtitle={releaseYear ? releaseYear.toString() : undefined}
              />
            );
          })}
        </motion.div>
      </ToolCardBody>
    </ToolCard>
  );
};

export default GetSpotifyArtistAlbumsResult;
