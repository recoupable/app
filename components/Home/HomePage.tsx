"use client";

import { useMiniKit } from "@coinbase/onchainkit/minikit";
import NewChatBootstrap from "../VercelChat/NewChatBootstrap";
import ValuationHero from "./ValuationHero";
import useHomeValuation from "@/hooks/useHomeValuation";
import { useEffect } from "react";
import { UIMessage } from "ai";

const HomePage = ({ initialMessages }: { initialMessages?: UIMessage[] }) => {
  const { setFrameReady, isFrameReady } = useMiniKit();
  const valuation = useHomeValuation();

  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [setFrameReady, isFrameReady]);

  return (
    <div className="flex flex-col size-full items-center">
      {valuation.show && (
        <div className="w-full max-w-3xl px-4 pt-6 md:px-0">
          <ValuationHero
            artistName={valuation.artistName}
            artistImage={valuation.artistImage}
            valuation={valuation.valuation}
            measuredTrackCount={valuation.measuredTrackCount}
          />
        </div>
      )}
      <NewChatBootstrap
        initialMessages={initialMessages}
        hideGreeting={valuation.show}
      />
    </div>
  );
};

export default HomePage;
