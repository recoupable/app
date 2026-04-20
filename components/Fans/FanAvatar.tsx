import { type Social } from "@/types/ArtistSocials";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface FanAvatarProps {
  fan: Social;
}

const FanAvatar = ({ fan }: FanAvatarProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const formattedFollowerCount = fan.follower_count.toLocaleString();

  const getInitials = (username: string) => {
    if (!username) return "?";
    const parts = username.replace(/[@_]/g, " ").trim().split(/\s+/);
    if (parts.length === 0) return "?";
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const initials = getInitials(fan.username);

  return (
    <div
      className="relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <a
        href={fan.profile_url}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
      >
        <div className="relative transition-all duration-300 group-hover:ring-2 group-hover:ring-blue-500 rounded-full">
          <Avatar className="w-full h-full">
            <AvatarImage
              src={fan.avatar || ""}
              alt={fan.username || "Fan profile"}
            />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </div>

        <div
          className={`absolute inset-0 hidden sm:flex flex-col items-center justify-center bg-black bg-opacity-70 rounded-full text-white p-1 text-center transition-opacity duration-300 ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="text-xs font-medium truncate w-full">
            {fan.username || "Anonymous"}
          </div>
          <div className="text-[10px] text-muted-foreground">
            {formattedFollowerCount}
          </div>
        </div>
      </a>
    </div>
  );
};

export default FanAvatar;
