import { useArtistProvider } from "@/providers/ArtistProvider";
import { useUserProvider } from "@/providers/UserProvder";
import ImageWithFallback from "@/components/ImageWithFallback";

/**
 * Displays a simple greeting message asking about the selected artist
 * Shows "Ask me about [Avatar] [Selected Artist]" or fallback text
 */
export function ChatGreeting({ isVisible }: { isVisible: boolean }) {
  const { selectedArtist } = useArtistProvider();
  const { name } = useUserProvider();
  const artistName = selectedArtist?.name || "";
  const artistImage = selectedArtist?.image || "";
  const isArtistSelected = !!selectedArtist;
  const displayName = (name || "").trim();

  const textStyle = `
    font-heading
    text-[20px]
    sm:text-[24px]
    lg:text-[28px] 
    leading-[1.4]
    sm:leading-[1.3]
    lg:leading-[1.3] 
    tracking-[-0.02em]
    font-medium
  `;

  const fadeBase = "transition-opacity duration-700 ease-out";
  const fadeStart = "opacity-0";
  const fadeEnd = "opacity-100";

  return (
    <div
      className={`
        ${textStyle} mb-6 mt-4 py-3 ${fadeBase}
        ${isVisible ? fadeEnd : fadeStart}
        text-center w-full
      `}
    >
      <span className="text-foreground font-normal inline-flex items-center gap-3 flex-wrap justify-center">
        
        How can I help you with{" "}
        {isArtistSelected && artistImage && (
          <span className="inline-block w-12 h-12 rounded-full overflow-hidden flex-shrink-0 ring-1 ring-foreground shadow-md">
            <ImageWithFallback src={artistImage} />
          </span>
        )}
        {isArtistSelected ? artistName : "your roster"}
        {!!displayName && <>{", "}{displayName}</>}
        ?
      </span>
    </div>
  );
}

export default ChatGreeting;
