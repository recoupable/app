"use client";

import { useMiniKit } from "@coinbase/onchainkit/minikit";
import { Chat } from "../VercelChat/chat";
import { useEffect } from "react";
import { UIMessage } from "ai";

const HomePage = ({
  id,
  initialMessages,
}: {
  id: string;
  initialMessages?: UIMessage[];
}) => {
  const { setFrameReady, isFrameReady } = useMiniKit();

  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [setFrameReady, isFrameReady]);

  return (
    <div className="flex flex-col size-full items-center">
      <Chat id={id} initialMessages={initialMessages} />
    </div>
  );
};

export default HomePage;
