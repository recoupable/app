"use client";

import { useMiniKit } from "@coinbase/onchainkit/minikit";
import { Chat } from "../VercelChat/chat";
import { useEffect } from "react";
import { UIMessage } from "ai";

const HomePage = ({
  id,
  initialMessages,
  email,
}: {
  id: string;
  initialMessages?: UIMessage[];
  email?: string;
}) => {
  const { setFrameReady, isFrameReady } = useMiniKit();

  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [setFrameReady, isFrameReady]);

  return (
    <div className="flex flex-col size-full items-center">
      <Chat id={id} initialMessages={initialMessages} email={email} />
    </div>
  );
};

export default HomePage;
