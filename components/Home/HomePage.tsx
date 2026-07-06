"use client";

import { useMiniKit } from "@coinbase/onchainkit/minikit";
import NewChatBootstrap from "../VercelChat/NewChatBootstrap";
import TasksModule from "./TasksModule";
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
      <div className="flex w-full max-w-3xl flex-col gap-4 px-4 pt-6 empty:hidden md:px-0">
        <TasksModule />
      </div>
      <NewChatBootstrap initialMessages={initialMessages} />
    </div>
  );
};

export default HomePage;
