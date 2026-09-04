import { ArrowRight } from "lucide-react";
import Icon from "../Icon";
import { usePrivy } from "@privy-io/react-auth";
import createClientCheckoutSession from "@/lib/stripe/createClientCheckoutSession";

const UnlockProCard = () => {
  const { getAccessToken } = usePrivy();
  const handleClick = async () => {
    const accessToken = await getAccessToken();
    if (accessToken) await createClientCheckoutSession(accessToken);
  };

  return (
    <div className="w-full md:w-[250px] shadow-lg flex flex-col rounded-xl overflow-hidden mb-2 mt-0 aspect-[212/175] md:aspect-[212/190] bg-[url('/Background.png')] bg-cover bg-center border border-white p-4 relative mx-auto">
      <div className="absolute inset-0 border-2 border-white/30 rounded-xl pointer-events-none z-5"></div>
      <video
        className="absolute inset-0 w-full h-full object-cover rounded-xl opacity-20 pointer-events-none z-10"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        ref={(el) => {
          if (el) {
            el.playbackRate = 1.0;
            el.style.transform = "rotate(90deg) scale(1.2)";
            el.style.objectPosition = "center 25%";
            el.currentTime = 0.5;
          }
        }}
      >
        <source
          src="/backgrounds/White_Dots_Diagonal_Waves_Animation_source_2463953.mov"
          type="video/quicktime"
        />
        <source
          src="/backgrounds/White_Dots_Diagonal_Waves_Animation_source_2463953.mov"
          type="video/mp4"
        />
      </video>

      <div className="relative z-20">
        <div className="relative mb-2">
          <div className="absolute right-1 top-1">
            <Icon name="star" />
          </div>
          <div className="font-sans font-medium text-white text-2xl leading-tight">
            Unlock
            <br />
            Artist
            <br />
            Intelligence
          </div>
        </div>

        <p className="text-xs font-sans text-white/90 leading-tight mb-1 mt-1">
          Get better results with
          <br />
          <span className="font-sans font-medium">premium AI models</span>
        </p>

        <button
          type="button"
          className="font-sans font-medium text-xs bg-white/15 backdrop-blur-md text-white rounded-lg px-3 py-1.5 flex items-center gap-2 border border-white/20 hover:bg-white/25 transition-all duration-200 shadow-xl mt-3"
          onClick={handleClick}
        >
          Start Free Trial
          <ArrowRight className="size-3" />
        </button>
      </div>
    </div>
  );
};

export default UnlockProCard;
