"use client";

import { useMiniKit } from "@coinbase/onchainkit/minikit";
import NewChatBootstrap from "../VercelChat/NewChatBootstrap";
import { useEffect } from "react";
import { UIMessage } from "ai";

const HomePage = ({ initialMessages }: { initialMessages?: UIMessage[] }) => {
  const { setFrameReady, isFrameReady } = useMiniKit();

  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [setFrameReady, isFrameReady]);

  return (
    <div className="flex flex-col size-full items-center">
      <NewChatBootstrap initialMessages={initialMessages} />
    </div>
  );
};

export default HomePage;
