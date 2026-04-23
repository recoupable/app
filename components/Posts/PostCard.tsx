import { type Post } from "@/types/Post";
import { memo } from "react";
import { useInView } from "react-intersection-observer";
import dynamic from "next/dynamic";

const TwitterEmbed = dynamic(
  () => import("./embeds/TwitterEmbed").then((mod) => mod.TwitterEmbed),
  { ssr: false }
);
const TikTokEmbed = dynamic(
  () => import("./embeds/TikTokEmbed").then((mod) => mod.TikTokEmbed),
  { ssr: false }
);
const InstagramEmbed = dynamic(
  () => import("./embeds/InstagramEmbed").then((mod) => mod.InstagramEmbed),
  { ssr: false }
);
const GenericEmbed = dynamic(
  () => import("./embeds/GenericEmbed").then((mod) => mod.GenericEmbed),
  { ssr: false }
);

interface PostCardProps {
  post: Post;
}

// Use memo to prevent unnecessary re-renders
const PostCard = memo(({ post }: PostCardProps) => {
  // Use intersection observer to detect when the card is visible
  const { ref, inView } = useInView({
    triggerOnce: true, // Only trigger once
    threshold: 0.1,
    rootMargin: "300px", // Load when within 300px of viewport
  });

  // Format the date to a more readable format
  const formattedDate = new Date(post.updated_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  // Determine the platform from the URL
  const getPlatform = (url: string): string => {
    if (url.includes("twitter.com") || url.includes("x.com")) return "twitter";
    if (url.includes("instagram.com")) return "instagram";
    if (url.includes("facebook.com")) return "facebook";
    if (url.includes("tiktok.com")) return "tiktok";
    if (url.includes("youtube.com") || url.includes("youtu.be"))
      return "youtube";
    return "unknown";
  };

  const platform = getPlatform(post.post_url);

  // Render the appropriate embed component based on the platform
  const renderEmbed = () => {
    // Only render the embed if the card is in view
    if (!inView) {
      return (
        <div className="flex items-center justify-center p-4 bg-muted h-full">
          <div className="animate-pulse bg-muted h-8 w-32 rounded"></div>
        </div>
      );
    }

    // Render the appropriate platform-specific embed
    switch (platform) {
      case "twitter":
        return <TwitterEmbed url={post.post_url} />;
      case "tiktok":
        return <TikTokEmbed url={post.post_url} />;
      case "instagram":
        return <InstagramEmbed url={post.post_url} />;
      default:
        return <GenericEmbed url={post.post_url} platform={platform} />;
    }
  };

  return (
    <div
      ref={ref}
      className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-card h-full flex flex-col"
    >
      <div className="p-3 border-b bg-muted">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium capitalize">{platform}</span>
          <span className="text-xs text-muted-foreground">{formattedDate}</span>
        </div>
      </div>
      <div className="flex-grow">{renderEmbed()}</div>
    </div>
  );
});

// Add display name for debugging
PostCard.displayName = "PostCard";

export default PostCard;
