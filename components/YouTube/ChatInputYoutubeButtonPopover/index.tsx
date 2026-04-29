import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import useYoutubeStatus from "@/hooks/useYoutubeStatus";
import useYoutubeChannel from "@/hooks/useYoutubeChannel";
import useIsMobile from "@/hooks/useIsMobile";
import { useState } from "react";
import { PopoverContent } from "./PopoverContent";

const ChatInputYoutubeButtonPopover = ({ children, artistAccountId }: { children: React.ReactNode; artistAccountId: string }) => {
  const { data: youtubeStatus, isLoading } = useYoutubeStatus(artistAccountId);
  const { data: channelInfo, isLoading: isChannelInfoLoading } = useYoutubeChannel(artistAccountId);
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);
  const channel = channelInfo?.channels?.[0];

  if (youtubeStatus?.status === "invalid" || isLoading || isChannelInfoLoading) {
    return children;
  }

  if (isMobile) {
    return (
      <div className="relative">
        <div onClick={() => setIsOpen(!isOpen)}>
          {children}
        </div>
        
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40 bg-black/20" onClick={() => setIsOpen(false)} />
            <div className="absolute bottom-full -right-4 mb-2 z-50 max-w-[calc(100vw-1rem)] translate-x-[11rem]">
              <PopoverContent channel={channel} />
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <HoverCard openDelay={0} closeDelay={0}>
      <HoverCardTrigger>{children}</HoverCardTrigger>
      <HoverCardContent className="p-0">
        <PopoverContent channel={channel} />
      </HoverCardContent>
    </HoverCard>
  );
};

export default ChatInputYoutubeButtonPopover;
